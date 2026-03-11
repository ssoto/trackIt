import { render, cleanup, within } from '@testing-library/react/pure';
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import ProgressRing from './ProgressRing';

const feature = await loadFeature('./components/ProgressRing.feature');

describeFeature(feature, ({ Scenario }) => {
    Scenario('Shows zero minutes label when no time is tracked', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a ProgressRing with {string} minutes', (_ctx, minutes: string) => {
            cleanup();
            ({ container } = render(<ProgressRing minutes={Number(minutes)} />));
        });
        Then('I should see the label {string}', (_ctx, label: string) => {
            expect(within(container).getByText(label)).toBeInTheDocument();
        });
    });

    Scenario('Shows hours and minutes label for tracked time', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a ProgressRing with {string} minutes', (_ctx, minutes: string) => {
            cleanup();
            ({ container } = render(<ProgressRing minutes={Number(minutes)} />));
        });
        Then('I should see the label {string}', (_ctx, label: string) => {
            expect(within(container).getByText(label)).toBeInTheDocument();
        });
    });

    Scenario('Shows only hours when minutes are zero', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a ProgressRing with {string} minutes', (_ctx, minutes: string) => {
            cleanup();
            ({ container } = render(<ProgressRing minutes={Number(minutes)} />));
        });
        Then('I should see the label {string}', (_ctx, label: string) => {
            expect(within(container).getByText(label)).toBeInTheDocument();
        });
    });

    Scenario('Shows only minutes when under one hour', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a ProgressRing with {string} minutes', (_ctx, minutes: string) => {
            cleanup();
            ({ container } = render(<ProgressRing minutes={Number(minutes)} />));
        });
        Then('I should see the label {string}', (_ctx, label: string) => {
            expect(within(container).getByText(label)).toBeInTheDocument();
        });
    });

    Scenario('Renders an SVG ring', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a ProgressRing with {string} minutes', (_ctx, minutes: string) => {
            cleanup();
            ({ container } = render(<ProgressRing minutes={Number(minutes)} />));
        });
        Then('an SVG element should be present', (_ctx) => {
            expect(container.querySelector('svg')).toBeInTheDocument();
        });
    });
});
