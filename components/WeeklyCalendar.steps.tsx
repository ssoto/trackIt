import { render, cleanup, within } from '@testing-library/react/pure';
import userEvent from '@testing-library/user-event';
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { vi } from 'vitest';
import WeeklyCalendar from './WeeklyCalendar';

const feature = await loadFeature('./components/WeeklyCalendar.feature');

const monday = new Date('2024-03-11');

const defaultProps = {
    currentWeek: monday,
    onWeekChange: vi.fn(),
    dailyTotals: {},
    showWeekends: false,
    selectedDate: '2024-03-11',
    onDaySelect: vi.fn(),
};

describeFeature(feature, ({ Scenario }) => {
    Scenario('Renders the Weekly Overview heading', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a WeeklyCalendar for the current week', (_ctx) => {
            cleanup();
            ({ container } = render(<WeeklyCalendar {...defaultProps} />));
        });
        Then('I should see the heading {string}', (_ctx, heading: string) => {
            expect(within(container).getByRole('heading', { name: heading })).toBeInTheDocument();
        });
    });

    Scenario('Shows navigation buttons', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a WeeklyCalendar for the current week', (_ctx) => {
            cleanup();
            ({ container } = render(<WeeklyCalendar {...defaultProps} />));
        });
        Then('the navigation buttons should be visible', (_ctx) => {
            expect(within(container).getByRole('button', { name: 'Previous week' })).toBeInTheDocument();
            expect(within(container).getByRole('button', { name: 'Next week' })).toBeInTheDocument();
            expect(within(container).getByRole('button', { name: 'Today' })).toBeInTheDocument();
        });
    });

    Scenario('Shows 5 day columns when weekends are hidden', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a WeeklyCalendar with weekends hidden', (_ctx) => {
            cleanup();
            ({ container } = render(<WeeklyCalendar {...defaultProps} showWeekends={false} />));
        });
        Then('I should see {string} day columns', (_ctx, _count: string) => {
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach(day => {
                expect(within(container).getByText(day)).toBeInTheDocument();
            });
            expect(within(container).queryByText('Sat')).not.toBeInTheDocument();
        });
    });

    Scenario('Shows 7 day columns when weekends are shown', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a WeeklyCalendar with weekends shown', (_ctx) => {
            cleanup();
            ({ container } = render(<WeeklyCalendar {...defaultProps} showWeekends={true} />));
        });
        Then('I should see {string} day columns', (_ctx, _count: string) => {
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
                expect(within(container).getByText(day)).toBeInTheDocument();
            });
        });
    });

    Scenario('Calls onWeekChange when Previous week is clicked', ({ Given, When, Then }) => {
        let container: HTMLElement;
        const onWeekChange = vi.fn();
        Given('a WeeklyCalendar for the current week', (_ctx) => {
            cleanup();
            ({ container } = render(<WeeklyCalendar {...defaultProps} onWeekChange={onWeekChange} />));
        });
        When('I click the {string} button', async (_ctx, name: string) => {
            await userEvent.click(within(container).getByRole('button', { name }));
        });
        Then('onWeekChange should have been called', (_ctx) => {
            expect(onWeekChange).toHaveBeenCalledOnce();
        });
    });

    Scenario('Calls onWeekChange when Next week is clicked', ({ Given, When, Then }) => {
        let container: HTMLElement;
        const onWeekChange = vi.fn();
        Given('a WeeklyCalendar for the current week', (_ctx) => {
            cleanup();
            ({ container } = render(<WeeklyCalendar {...defaultProps} onWeekChange={onWeekChange} />));
        });
        When('I click the {string} button', async (_ctx, name: string) => {
            await userEvent.click(within(container).getByRole('button', { name }));
        });
        Then('onWeekChange should have been called', (_ctx) => {
            expect(onWeekChange).toHaveBeenCalledOnce();
        });
    });

    Scenario('Calls onDaySelect when a day is clicked', ({ Given, When, Then }) => {
        let container: HTMLElement;
        const onDaySelect = vi.fn();
        Given('a WeeklyCalendar for the current week', (_ctx) => {
            cleanup();
            ({ container } = render(<WeeklyCalendar {...defaultProps} onDaySelect={onDaySelect} />));
        });
        When('I click on a day', async (_ctx) => {
            await userEvent.click(within(container).getByText('Mon'));
        });
        Then('onDaySelect should have been called', (_ctx) => {
            expect(onDaySelect).toHaveBeenCalledOnce();
        });
    });
});
