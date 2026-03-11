Feature: ProgressRing component
  As a user
  I want to see a visual progress ring
  So that I can know how much of my daily goal I've completed

  Scenario: Shows zero minutes label when no time is tracked
    Given a ProgressRing with "0" minutes
    Then I should see the label "0m"

  Scenario: Shows hours and minutes label for tracked time
    Given a ProgressRing with "90" minutes
    Then I should see the label "1h30m"

  Scenario: Shows only hours when minutes are zero
    Given a ProgressRing with "120" minutes
    Then I should see the label "2h"

  Scenario: Shows only minutes when under one hour
    Given a ProgressRing with "45" minutes
    Then I should see the label "45m"

  Scenario: Renders an SVG ring
    Given a ProgressRing with "60" minutes
    Then an SVG element should be present
