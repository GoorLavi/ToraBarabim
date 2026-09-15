import type { CloudWatchAlarmMessage } from './models';

const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

// The Lambda's own clock is UTC (all Lambda runtimes are); every timestamp
// CloudWatch sends is UTC too, so this is the one place that converts to the
// time zone an Israeli reader expects before the text goes anywhere.
const formatIsraelTime = (isoTimestamp: string): string =>
  new Intl.DateTimeFormat('he-IL', {
    timeZone: ISRAEL_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoTimestamp));

const isCloudWatchAlarmMessage = (value: unknown): value is CloudWatchAlarmMessage => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.AlarmName === 'string' &&
    (candidate.AlarmDescription === undefined ||
      candidate.AlarmDescription === null ||
      typeof candidate.AlarmDescription === 'string') &&
    (candidate.NewStateValue === 'ALARM' || candidate.NewStateValue === 'OK') &&
    typeof candidate.NewStateReason === 'string' &&
    typeof candidate.StateChangeTime === 'string'
  );
};

const tryParseJson = (rawMessage: string): unknown => {
  try {
    return JSON.parse(rawMessage);
  } catch {
    return undefined;
  }
};

const formatAlarmState = (message: CloudWatchAlarmMessage): string =>
  [
    '🔴 תורה ברבים למטה',
    message.AlarmDescription ?? message.AlarmName,
    `סיבה: ${message.NewStateReason}`,
    `זמן: ${formatIsraelTime(message.StateChangeTime)}`,
  ].join('\n');

const formatOkState = (message: CloudWatchAlarmMessage): string =>
  [
    '🟢 תורה ברבים חזר לאוויר',
    `ההתראה שחזרה לתקין: ${message.AlarmDescription ?? message.AlarmName}`,
    `זמן: ${formatIsraelTime(message.StateChangeTime)}`,
  ].join('\n');

const formatRawText = (rawMessage: string): string => `הודעה מ-SNS (לא בפורמט התרעת CloudWatch):\n\n${rawMessage}`;

// Pure by design: no network or AWS call, so the test can exercise it
// directly without a Lambda runtime or a fake SNS event.
export const formatAlertMessage = (rawMessage: string): string => {
  const parsed = tryParseJson(rawMessage);
  if (isCloudWatchAlarmMessage(parsed)) {
    return parsed.NewStateValue === 'ALARM' ? formatAlarmState(parsed) : formatOkState(parsed);
  }
  return formatRawText(rawMessage);
};
