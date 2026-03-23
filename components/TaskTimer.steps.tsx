import { render, cleanup, within, act } from '@testing-library/react/pure';
import userEvent from '@testing-library/user-event';
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { vi } from 'vitest';
import TaskTimer from './TaskTimer';

const feature = await loadFeature('./components/TaskTimer.feature');

const makeActiveTask = (description: string) => ({
    id: 1,
    description,
    start_time: new Date(Date.now() - 60000).toISOString(),
    end_time: null,
    duration: null,
    status: 'in_progress' as const,
    created_at: new Date().toISOString(),
    profile_id: 1,
});

describeFeature(feature, ({ Scenario }) => {
    Scenario('Shows idle state with description input and Start button when no task is active', ({ Given, Then, And }) => {
        let container: HTMLElement;
        Given('the TaskTimer is rendered with no active task', async (_ctx) => {
            cleanup();
            global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ task: null }) });
            await act(async () => { ({ container } = render(<TaskTimer onTaskUpdate={vi.fn()} profileId={1} />)); });
        });
        Then('I should see the description input', (_ctx) => {
            expect(within(container).getByPlaceholderText('What are you working on?')).toBeInTheDocument();
        });
        And('I should see the {string} button', (_ctx, name: string) => {
            expect(within(container).getByRole('button', { name })).toBeInTheDocument();
        });
    });

    Scenario('Start button is disabled when description is empty', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('the TaskTimer is rendered with no active task', async (_ctx) => {
            cleanup();
            global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ task: null }) });
            await act(async () => { ({ container } = render(<TaskTimer onTaskUpdate={vi.fn()} profileId={1} />)); });
        });
        Then('the {string} button should be disabled', (_ctx, name: string) => {
            expect(within(container).getByRole('button', { name })).toBeDisabled();
        });
    });

    Scenario('Start button is enabled after typing a description', ({ Given, When, Then }) => {
        let container: HTMLElement;
        Given('the TaskTimer is rendered with no active task', async (_ctx) => {
            cleanup();
            global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ task: null }) });
            await act(async () => { ({ container } = render(<TaskTimer onTaskUpdate={vi.fn()} profileId={1} />)); });
        });
        When('I type {string} in the description input', async (_ctx, text: string) => {
            await userEvent.type(within(container).getByPlaceholderText('What are you working on?'), text);
        });
        Then('the {string} button should be enabled', (_ctx, name: string) => {
            expect(within(container).getByRole('button', { name })).toBeEnabled();
        });
    });

    Scenario('Shows error when Enter is pressed with empty description', ({ Given, When, Then }) => {
        let container: HTMLElement;
        Given('the TaskTimer is rendered with no active task', async (_ctx) => {
            cleanup();
            global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ task: null }) });
            await act(async () => { ({ container } = render(<TaskTimer onTaskUpdate={vi.fn()} profileId={1} />)); });
        });
        When('I press Enter in the description input', async (_ctx) => {
            await act(async () => {
                await userEvent.type(within(container).getByPlaceholderText('What are you working on?'), '{Enter}');
            });
        });
        Then('I should see an error message', (_ctx) => {
            expect(within(container).getByText(/please enter a task description/i)).toBeInTheDocument();
        });
    });

    Scenario('Shows running state after starting a task', ({ Given, And, When, Then }) => {
        let container: HTMLElement;
        Given('the TaskTimer is rendered with no active task', async (_ctx) => {
            cleanup();
            global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ task: null }) });
            await act(async () => { ({ container } = render(<TaskTimer onTaskUpdate={vi.fn()} profileId={1} />)); });
        });
        And('the API will accept a new task', (_ctx) => {
            global.fetch = vi.fn()
                .mockResolvedValue({ ok: true, json: async () => ({ task: makeActiveTask('My task') }) });
        });
        When('I type {string} in the description input', async (_ctx, text: string) => {
            await userEvent.type(within(container).getByPlaceholderText('What are you working on?'), text);
        });
        And('I click the {string} button', async (_ctx, name: string) => {
            await act(async () => {
                await userEvent.click(within(container).getByRole('button', { name }));
            });
        });
        Then('I should see the {string} button', (_ctx, name: string) => {
            expect(within(container).getByRole('button', { name })).toBeInTheDocument();
        });
        And('the description input should not be visible', (_ctx) => {
            expect(within(container).queryByPlaceholderText('What are you working on?')).not.toBeInTheDocument();
        });
    });

    Scenario('Shows Stop button and elapsed time when a task is already active', ({ Given, Then, And }) => {
        let container: HTMLElement;
        Given('the TaskTimer is rendered with an active task {string}', async (_ctx, description: string) => {
            cleanup();
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ task: makeActiveTask(description) }),
            });
            await act(async () => { ({ container } = render(<TaskTimer onTaskUpdate={vi.fn()} profileId={1} />)); });
        });
        Then('I should see the {string} button', (_ctx, name: string) => {
            expect(within(container).getByRole('button', { name })).toBeInTheDocument();
        });
        And('I should see the text {string}', (_ctx, text: string) => {
            expect(within(container).getByText(text)).toBeInTheDocument();
        });
    });
});
