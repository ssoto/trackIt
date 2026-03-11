import { render, cleanup, within } from '@testing-library/react/pure';
import userEvent from '@testing-library/user-event';
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { vi } from 'vitest';
import DailySummaryComponent from './DailySummary';
import type { DailySummary, Task } from '@/lib/types';

const feature = await loadFeature('./components/DailySummary.feature');

const TODAY = '2024-03-11';

function makeTask(description: string, id = 1): Task {
    return {
        id,
        description,
        start_time: `${TODAY}T09:00:00.000Z`,
        end_time: `${TODAY}T10:00:00.000Z`,
        duration: 3600000,
        status: 'done',
        created_at: `${TODAY}T09:00:00.000Z`,
    };
}

function makeSummary(tasks: Task[] = [], totalMinutes = 0): DailySummary[] {
    return [{ date: TODAY, tasks, totalMinutes }];
}

const defaultProps = {
    onDeleteTask: vi.fn(),
    onUpdateTask: vi.fn(),
    onCreateTask: vi.fn().mockResolvedValue(true),
    selectedDate: TODAY,
    onDaySelect: vi.fn(),
};

describeFeature(feature, ({ Scenario }) => {
    Scenario('Renders the Daily Summary heading', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a DailySummary with one day of data', (_ctx) => {
            cleanup();
            ({ container } = render(<DailySummaryComponent {...defaultProps} summaries={makeSummary()} />));
        });
        Then('I should see the heading {string}', (_ctx, heading: string) => {
            expect(within(container).getByRole('heading', { name: heading })).toBeInTheDocument();
        });
    });

    Scenario('Shows total week minutes', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a DailySummary with {string} total minutes this week', (_ctx, minutes: string) => {
            cleanup();
            ({ container } = render(<DailySummaryComponent {...defaultProps} summaries={makeSummary([], Number(minutes))} />));
        });
        Then('I should see the weekly total {string}', (_ctx, total: string) => {
            const weekSection = within(container).getByText('Total This Week').parentElement!;
            expect(within(weekSection as HTMLElement).getByText(total)).toBeInTheDocument();
        });
    });

    Scenario('Shows Add button for each day', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a DailySummary with one day of data', (_ctx) => {
            cleanup();
            ({ container } = render(<DailySummaryComponent {...defaultProps} summaries={makeSummary()} />));
        });
        Then('I should see an {string} button', (_ctx, label: string) => {
            expect(within(container).getByRole('button', { name: label })).toBeInTheDocument();
        });
    });

    Scenario('Opens create form when Add is clicked', ({ Given, When, Then, And }) => {
        let container: HTMLElement;
        Given('a DailySummary with one day of data', (_ctx) => {
            cleanup();
            ({ container } = render(<DailySummaryComponent {...defaultProps} summaries={makeSummary()} />));
        });
        When('I click the {string} button', async (_ctx, label: string) => {
            await userEvent.click(within(container).getByRole('button', { name: label }));
        });
        Then('I should see the {string} input', (_ctx, placeholder: string) => {
            expect(within(container).getByPlaceholderText(placeholder)).toBeInTheDocument();
        });
        And('I should see the {string} button', (_ctx, label: string) => {
            expect(within(container).getByRole('button', { name: label })).toBeInTheDocument();
        });
    });

    Scenario('Create Task button is disabled when description is empty', ({ Given, When, Then }) => {
        let container: HTMLElement;
        Given('a DailySummary with one day of data', (_ctx) => {
            cleanup();
            ({ container } = render(<DailySummaryComponent {...defaultProps} summaries={makeSummary()} />));
        });
        When('I click the {string} button', async (_ctx, label: string) => {
            await userEvent.click(within(container).getByRole('button', { name: label }));
        });
        Then('the {string} button should be disabled', (_ctx, label: string) => {
            expect(within(container).getByRole('button', { name: label })).toBeDisabled();
        });
    });

    Scenario('Shows task description in the list', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a DailySummary with a task {string}', (_ctx, description: string) => {
            cleanup();
            ({ container } = render(<DailySummaryComponent {...defaultProps} summaries={makeSummary([makeTask(description)])} />));
        });
        Then('I should see the task {string} in the list', (_ctx, description: string) => {
            const input = within(container).getByDisplayValue(description);
            expect(input).toBeInTheDocument();
        });
    });

    Scenario('Shows delete button on hover', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a DailySummary with a task {string}', (_ctx, description: string) => {
            cleanup();
            ({ container } = render(<DailySummaryComponent {...defaultProps} summaries={makeSummary([makeTask(description)])} />));
        });
        Then('a {string} button should be present in the DOM', (_ctx, label: string) => {
            expect(within(container).getByRole('button', { name: label })).toBeInTheDocument();
        });
    });

    Scenario('Shows status badge for each task', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a DailySummary with a task {string}', (_ctx, description: string) => {
            cleanup();
            ({ container } = render(<DailySummaryComponent {...defaultProps} summaries={makeSummary([makeTask(description)])} />));
        });
        Then('I should see a status badge', (_ctx) => {
            expect(within(container).getByRole('button', { name: /to do|in progress|done/i })).toBeInTheDocument();
        });
    });
});
