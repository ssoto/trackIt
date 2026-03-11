Feature: TimePicker component
  As a user
  I want to pick a time for a task
  So that I can set accurate start and end times

  Scenario: Renders a time input with the given value
    Given a TimePicker with value "09:30"
    Then the time input should have value "09:30"

  Scenario: Renders a label when provided
    Given a TimePicker with label "Start Time"
    Then I should see the label "Start Time"

  Scenario: Renders a date badge when dateLabel is provided
    Given a TimePicker with dateLabel "Mon, Feb 18"
    Then I should see the date badge "Mon, Feb 18"

  Scenario: Does not render a label when none is provided
    Given a TimePicker with no label
    Then no label element should be visible

  Scenario: Calls onChange when the time input changes
    Given a TimePicker with value "08:00"
    When the user changes the time to "10:00"
    Then onChange should be called with "10:00"
