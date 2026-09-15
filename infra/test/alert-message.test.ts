import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { formatAlertMessage } from '../lib/alert-notifier/message';

describe('formatAlertMessage', () => {
  test('formats a CloudWatch alarm notification in state ALARM', () => {
    const raw = JSON.stringify({
      AlarmName: 'ServerErrorAlarm',
      AlarmDescription: 'The API returned a 5xx response',
      NewStateValue: 'ALARM',
      NewStateReason: 'Threshold Crossed: 1 datapoint was greater than the threshold',
      StateChangeTime: '2026-09-15T10:30:00.000+0000',
    });

    const text = formatAlertMessage(raw);

    assert.match(text, /תורה ברבים למטה/);
    assert.match(text, /The API returned a 5xx response/);
    assert.match(text, /Threshold Crossed/);
  });

  test('formats a CloudWatch alarm notification in state OK', () => {
    const raw = JSON.stringify({
      AlarmName: 'NoHealthyTaskAlarm',
      AlarmDescription: 'The service has had no running task publishing metrics for 5 minutes',
      NewStateValue: 'OK',
      NewStateReason: 'Threshold Crossed: no datapoints breached the threshold',
      StateChangeTime: '2026-09-15T11:00:00.000+0000',
    });

    const text = formatAlertMessage(raw);

    assert.match(text, /תורה ברבים חזר לאוויר/);
    assert.match(text, /The service has had no running task publishing metrics for 5 minutes/);
  });

  test('falls back to the alarm name when an ALARM notification has a null description', () => {
    const raw = JSON.stringify({
      AlarmName: 'ServerErrorAlarm',
      AlarmDescription: null,
      NewStateValue: 'ALARM',
      NewStateReason: 'Threshold Crossed: 1 datapoint was greater than the threshold',
      StateChangeTime: '2026-09-15T10:30:00.000+0000',
    });

    const text = formatAlertMessage(raw);

    assert.match(text, /תורה ברבים למטה/);
    assert.match(text, /ServerErrorAlarm/);
  });

  test('is still recognized as a CloudWatch alarm when AlarmDescription is absent entirely', () => {
    const raw = JSON.stringify({
      AlarmName: 'ServerErrorAlarm',
      NewStateValue: 'ALARM',
      NewStateReason: 'Threshold Crossed: 1 datapoint was greater than the threshold',
      StateChangeTime: '2026-09-15T10:30:00.000+0000',
    });

    const text = formatAlertMessage(raw);

    assert.match(text, /תורה ברבים למטה/);
    assert.match(text, /ServerErrorAlarm/);
    assert.doesNotMatch(text, /הודעה מ-SNS/);
  });

  test('returns plain text under a clear header when the message is not a CloudWatch alarm payload', () => {
    const raw = 'a manual test message from aws sns publish';

    const text = formatAlertMessage(raw);

    assert.match(text, /הודעה מ-SNS/);
    assert.match(text, /a manual test message from aws sns publish/);
  });

  test('treats malformed JSON as plain text rather than throwing', () => {
    const raw = '{ this is not valid json';

    const text = formatAlertMessage(raw);

    assert.match(text, /הודעה מ-SNS/);
    assert.match(text, /this is not valid json/);
  });
});
