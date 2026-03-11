Feature: DailySummary component
  As a user
  I want to see my daily task summaries
  So that I can review and manage my tracked work

  Scenario: Renders the Daily Summary heading
    Given a DailySummary with one day of data
    Then I should see the heading "Daily Summary"

  Scenario: Shows total week minutes
    Given a DailySummary with "120" total minutes this week
    Then I should see the weekly total "2h"

  Scenario: Shows Add button for each day
    Given a DailySummary with one day of data
    Then I should see an "Add" button

  Scenario: Opens create form when Add is clicked
    Given a DailySummary with one day of data
    When I click the "Add" button
    Then I should see the "Task description" input
    And I should see the "Create Task" button

  Scenario: Create Task button is disabled when description is empty
    Given a DailySummary with one day of data
    When I click the "Add" button
    Then the "Create Task" button should be disabled

  Scenario: Shows task description in the list
    Given a DailySummary with a task "Write unit tests"
    Then I should see the task "Write unit tests" in the list

  Scenario: Shows delete button on hover
    Given a DailySummary with a task "My task"
    Then a "Delete task" button should be present in the DOM

  Scenario: Shows status badge for each task
    Given a DailySummary with a task "Status task"
    Then I should see a status badge
