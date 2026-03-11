Feature: WeeklyCalendar component
  As a user
  I want to see my weekly overview
  So that I can understand my time distribution across the week

  Scenario: Renders the Weekly Overview heading
    Given a WeeklyCalendar for the current week
    Then I should see the heading "Weekly Overview"

  Scenario: Shows navigation buttons
    Given a WeeklyCalendar for the current week
    Then the navigation buttons should be visible

  Scenario: Shows 5 day columns when weekends are hidden
    Given a WeeklyCalendar with weekends hidden
    Then I should see "5" day columns

  Scenario: Shows 7 day columns when weekends are shown
    Given a WeeklyCalendar with weekends shown
    Then I should see "7" day columns

  Scenario: Calls onWeekChange when Previous week is clicked
    Given a WeeklyCalendar for the current week
    When I click the "Previous week" button
    Then onWeekChange should have been called

  Scenario: Calls onWeekChange when Next week is clicked
    Given a WeeklyCalendar for the current week
    When I click the "Next week" button
    Then onWeekChange should have been called

  Scenario: Calls onDaySelect when a day is clicked
    Given a WeeklyCalendar for the current week
    When I click on a day
    Then onDaySelect should have been called
