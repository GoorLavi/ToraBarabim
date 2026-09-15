// The subset of CloudWatch's own alarm-notification JSON this module reads.
// CloudWatch always sends more fields than these; only the ones the Hebrew
// message needs are modelled. AlarmDescription is optional as well as
// nullable: an alarm with no description configured can arrive either way.
export interface CloudWatchAlarmMessage {
  AlarmName: string;
  AlarmDescription?: string | null;
  NewStateValue: 'ALARM' | 'OK';
  NewStateReason: string;
  StateChangeTime: string;
}
