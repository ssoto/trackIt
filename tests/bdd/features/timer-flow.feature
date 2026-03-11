Feature: Timer flow
  As a user
  I want to track time on my tasks
  So that I can see how long I spent working

  Background:
    Given the app is open
    And no timer is currently running

  Scenario: Timer shows idle state with Start button
    Then I should see the "Start" button
    And I should see the task description input

  Scenario: User starts a timer with a description
    When I type "Writing BDD tests" in the task description
    And I click the "Start" button
    Then I should see the "Stop" button

  Scenario: User stops the running timer
    When I type "Stop me please" in the task description
    And I click the "Start" button
    And I click the "Stop" button
    Then I should see the "Start" button

  Scenario: Completed task appears in daily summary
    When I type "BDD flow task" in the task description
    And I click the "Start" button
    And I click the "Stop" button
    Then the task "BDD flow task" should appear in the daily summary
