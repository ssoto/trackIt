import { render, cleanup, within, act } from '@testing-library/react/pure';
import userEvent from '@testing-library/user-event';
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { vi } from 'vitest';
import { ToastContainer, showToast } from './Toast';

const feature = await loadFeature('./components/Toast.feature');

describeFeature(feature, ({ Scenario }) => {
    Scenario('Shows a toast message when showToast is called', ({ Given, When, Then }) => {
        let container: HTMLElement;
        Given('the ToastContainer is rendered', (_ctx) => {
            cleanup();
            ({ container } = render(<ToastContainer />));
        });
        When('showToast is called with message {string}', (_ctx, message: string) => {
            act(() => { showToast({ message }); });
        });
        Then('I should see the text {string}', (_ctx, text: string) => {
            expect(within(container).getByText(text)).toBeInTheDocument();
        });
    });

    Scenario('Shows an action button when action is provided', ({ Given, When, Then }) => {
        let container: HTMLElement;
        Given('the ToastContainer is rendered', (_ctx) => {
            cleanup();
            ({ container } = render(<ToastContainer />));
        });
        When('showToast is called with message {string} and action label {string}', (_ctx, message: string, label: string) => {
            act(() => { showToast({ message, action: { label, onClick: vi.fn() } }); });
        });
        Then('I should see a button labeled {string}', (_ctx, label: string) => {
            expect(within(container).getByRole('button', { name: label })).toBeInTheDocument();
        });
    });

    Scenario('Calls action onClick when the action button is clicked', ({ Given, When, And, Then }) => {
        let container: HTMLElement;
        let actionCallback: ReturnType<typeof vi.fn>;
        Given('the ToastContainer is rendered', (_ctx) => {
            cleanup();
            ({ container } = render(<ToastContainer />));
        });
        When('showToast is called with message {string} and action label {string}', (_ctx, message: string, label: string) => {
            actionCallback = vi.fn();
            act(() => { showToast({ message, action: { label, onClick: actionCallback } }); });
        });
        And('the user clicks the {string} button', async (_ctx, label: string) => {
            await userEvent.click(within(container).getByRole('button', { name: label }));
        });
        Then('the action callback should have been called', (_ctx) => {
            expect(actionCallback).toHaveBeenCalledOnce();
        });
    });

    Scenario('Shows a dismiss button', ({ Given, When, Then }) => {
        let container: HTMLElement;
        Given('the ToastContainer is rendered', (_ctx) => {
            cleanup();
            ({ container } = render(<ToastContainer />));
        });
        When('showToast is called with message {string}', (_ctx, message: string) => {
            act(() => { showToast({ message }); });
        });
        Then('I should see a dismiss button', (_ctx) => {
            expect(within(container).getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
        });
    });
});
