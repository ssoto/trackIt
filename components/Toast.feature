Feature: ToastContainer component
  As a user
  I want to see notification toasts
  So that I can be informed of actions and their outcomes

  Scenario: Shows a toast message when showToast is called
    Given the ToastContainer is rendered
    When showToast is called with message "Task deleted"
    Then I should see the text "Task deleted"

  Scenario: Shows an action button when action is provided
    Given the ToastContainer is rendered
    When showToast is called with message "Task deleted" and action label "Undo"
    Then I should see a button labeled "Undo"

  Scenario: Calls action onClick when the action button is clicked
    Given the ToastContainer is rendered
    When showToast is called with message "Item removed" and action label "Undo"
    And the user clicks the "Undo" button
    Then the action callback should have been called

  Scenario: Shows a dismiss button
    Given the ToastContainer is rendered
    When showToast is called with message "Hello"
    Then I should see a dismiss button
