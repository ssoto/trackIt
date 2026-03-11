Feature: TaskTimer component
  As a user
  I want to track time on a task
  So that I can measure how long I work on things

  Scenario: Shows idle state with description input and Start button when no task is active
    Given the TaskTimer is rendered with no active task
    Then I should see the description input
    And I should see the "Start" button

  Scenario: Start button is disabled when description is empty
    Given the TaskTimer is rendered with no active task
    Then the "Start" button should be disabled

  Scenario: Start button is enabled after typing a description
    Given the TaskTimer is rendered with no active task
    When I type "Working on tests" in the description input
    Then the "Start" button should be enabled

  Scenario: Shows error when Enter is pressed with empty description
    Given the TaskTimer is rendered with no active task
    When I press Enter in the description input
    Then I should see an error message

  Scenario: Shows running state after starting a task
    Given the TaskTimer is rendered with no active task
    And the API will accept a new task
    When I type "My task" in the description input
    And I click the "Start" button
    Then I should see the "Stop" button
    And the description input should not be visible

  Scenario: Shows Stop button and elapsed time when a task is already active
    Given the TaskTimer is rendered with an active task "Existing task"
    Then I should see the "Stop" button
    And I should see the text "Tracking"
