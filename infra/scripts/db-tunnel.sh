#!/usr/bin/env bash
# Opens a Systems Manager port-forwarding session THROUGH the running ECS
# server task to the production RDS Postgres endpoint. Nothing is exposed to
# the internet and no new infrastructure is created: this reuses the ECS Exec
# capability the Fargate task already has (decision 0010, infra/README.md).
#
# One command for a human to run:
#   npm run db:tunnel
#
# Everything the tunnel needs (cluster, service, running task, database
# endpoint) is read live from AWS at run time. Nothing here names an account
# id, a task id, or a database host: those change on every redeploy or
# failover.
set -euo pipefail

PROFILE="torabarabim"
REGION="eu-central-1"
SERVER_STACK="TorabarabimServer"
DATABASE_STACK="TorabarabimDatabase"
LOCAL_PORT=5434

fail() {
  echo ""
  echo "FAILED: $1" >&2
  echo "" >&2
  echo "$2" >&2
  exit 1
}

aws_query() {
  # Runs an aws cli command and returns its --output text, or empty string
  # on failure. Callers check for empty / "None" themselves so each failure
  # gets a specific, actionable message instead of a raw stack trace.
  aws "$@" --profile "$PROFILE" --region "$REGION" 2>/tmp/db-tunnel-aws-error.log || true
}

echo "Checking local tools..."

command -v aws >/dev/null 2>&1 || fail \
  "the AWS CLI is not on this machine's PATH." \
  "Install it (e.g. 'brew install awscli') and try again."

command -v session-manager-plugin >/dev/null 2>&1 || fail \
  "the Session Manager plugin for the AWS CLI is not installed." \
  "Install it (e.g. 'brew install --cask session-manager-plugin') and try again."

echo "Checking the '${PROFILE}' AWS session..."

if ! IDENTITY_OUTPUT=$(aws sts get-caller-identity --profile "$PROFILE" --region "$REGION" --output text 2>&1); then
  fail \
    "the '${PROFILE}' AWS profile's credentials are missing, expired, or invalid." \
    "Re-authenticate the '${PROFILE}' profile (whatever login step originally populated
it in ~/.aws/config, since this profile uses a custom credential process rather than a
plain access key) and run this script again. Raw AWS CLI error for diagnosis:
${IDENTITY_OUTPUT}"
fi

echo "Reading the ECS cluster and service from the '${SERVER_STACK}' stack..."

CLUSTER_NAME=$(aws cloudformation describe-stacks \
  --stack-name "$SERVER_STACK" --profile "$PROFILE" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ClusterName'].OutputValue | [0]" --output text 2>/dev/null || true)
SERVICE_NAME=$(aws cloudformation describe-stacks \
  --stack-name "$SERVER_STACK" --profile "$PROFILE" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ServiceName'].OutputValue | [0]" --output text 2>/dev/null || true)

if [[ -z "$CLUSTER_NAME" || "$CLUSTER_NAME" == "None" || -z "$SERVICE_NAME" || "$SERVICE_NAME" == "None" ]]; then
  fail \
    "could not read ClusterName / ServiceName from the '${SERVER_STACK}' stack outputs." \
    "Confirm the stack is deployed: 'aws cloudformation describe-stacks --stack-name ${SERVER_STACK} --profile ${PROFILE} --region ${REGION}'."
fi

echo "Cluster: ${CLUSTER_NAME}"
echo "Service: ${SERVICE_NAME}"
echo "Finding a running task..."

TASK_ARN=$(aws ecs list-tasks \
  --cluster "$CLUSTER_NAME" --service-name "$SERVICE_NAME" --desired-status RUNNING \
  --profile "$PROFILE" --region "$REGION" \
  --query "taskArns[0]" --output text 2>/dev/null || true)

if [[ -z "$TASK_ARN" || "$TASK_ARN" == "None" ]]; then
  fail \
    "no running task was found for service '${SERVICE_NAME}' on cluster '${CLUSTER_NAME}'." \
    "The ECS service may be scaled to zero, mid-deploy, or unhealthy. Check the ECS
console, or run:
  aws ecs list-tasks --cluster ${CLUSTER_NAME} --service-name ${SERVICE_NAME} --profile ${PROFILE} --region ${REGION}"
fi

TASK_ID="${TASK_ARN##*/}"

RUNTIME_ID=$(aws ecs describe-tasks \
  --cluster "$CLUSTER_NAME" --tasks "$TASK_ARN" \
  --profile "$PROFILE" --region "$REGION" \
  --query "tasks[0].containers[0].runtimeId" --output text 2>/dev/null || true)

if [[ -z "$RUNTIME_ID" || "$RUNTIME_ID" == "None" ]]; then
  fail \
    "the running task (${TASK_ID}) has no container runtime id yet." \
    "The task is probably still starting. Wait a few seconds and run this script again."
fi

echo "Task: ${TASK_ID}"
echo "Reading the database endpoint from the '${DATABASE_STACK}' stack..."

DB_INSTANCE_ID=$(aws cloudformation describe-stack-resources \
  --stack-name "$DATABASE_STACK" --profile "$PROFILE" --region "$REGION" \
  --query "StackResources[?ResourceType=='AWS::RDS::DBInstance'].PhysicalResourceId | [0]" --output text 2>/dev/null || true)

if [[ -z "$DB_INSTANCE_ID" || "$DB_INSTANCE_ID" == "None" ]]; then
  fail \
    "could not find the RDS instance in the '${DATABASE_STACK}' stack resources." \
    "Confirm the stack is deployed: 'aws cloudformation describe-stacks --stack-name ${DATABASE_STACK} --profile ${PROFILE} --region ${REGION}'."
fi

read -r DB_HOST DB_PORT DB_NAME DB_USER <<<"$(aws rds describe-db-instances \
  --db-instance-identifier "$DB_INSTANCE_ID" --profile "$PROFILE" --region "$REGION" \
  --query "DBInstances[0].[Endpoint.Address,Endpoint.Port,DBName,MasterUsername]" --output text)"

if [[ -z "$DB_HOST" || "$DB_HOST" == "None" ]]; then
  fail \
    "could not read the database endpoint for instance '${DB_INSTANCE_ID}'." \
    "Run 'aws rds describe-db-instances --db-instance-identifier ${DB_INSTANCE_ID} --profile ${PROFILE} --region ${REGION}' and check its status."
fi

# The secret is only used to print the human a ready-made command below;
# never read or printed here.
DB_SECRET_ARN=$(aws cloudformation describe-stack-resources \
  --stack-name "$DATABASE_STACK" --profile "$PROFILE" --region "$REGION" \
  --query "StackResources[?ResourceType=='AWS::SecretsManager::Secret'].PhysicalResourceId | [0]" --output text 2>/dev/null || true)

echo ""
echo "=================================================================="
echo " THIS TUNNEL POINTS AT THE PRODUCTION DATABASE."
echo " Local port ${LOCAL_PORT} -> ${DB_HOST}:${DB_PORT} (database '${DB_NAME}')"
echo " Local development Postgres is on 5433, NOT this port. Double-check"
echo " your DBeaver connection's port before running anything destructive."
echo "=================================================================="
echo ""
echo "DBeaver connection settings:"
echo "  Host:     localhost"
echo "  Port:     ${LOCAL_PORT}"
echo "  Database: ${DB_NAME}"
echo "  User:     ${DB_USER}"
echo "  Password: read it yourself, this script never prints it. See below."
echo ""
if [[ -n "$DB_SECRET_ARN" && "$DB_SECRET_ARN" != "None" ]]; then
  echo "Get the password (this puts a live production credential on your screen"
  echo "and in your shell history unless you clear it):"
  echo "  aws secretsmanager get-secret-value --secret-id ${DB_SECRET_ARN} --profile ${PROFILE} --region ${REGION} --query SecretString --output text"
else
  echo "Could not resolve the credentials secret ARN automatically. Find it in the"
  echo "Secrets Manager console under the '${DATABASE_STACK}' stack and read its"
  echo "'password' field the same way."
fi
echo ""
echo "Press Ctrl+C to close this tunnel when you are done."
echo ""

aws ssm start-session \
  --target "ecs:${CLUSTER_NAME}_${TASK_ID}_${RUNTIME_ID}" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "{\"host\":[\"${DB_HOST}\"],\"portNumber\":[\"${DB_PORT}\"],\"localPortNumber\":[\"${LOCAL_PORT}\"]}" \
  --profile "$PROFILE" \
  --region "$REGION"
