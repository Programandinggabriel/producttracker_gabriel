const nodeCron = require('node-cron')
const { execFile } = require('child_process');

const cron = [
    {
        name: 'Price alert notifier',
        path: './src/cron/price_alert_notifier.js',
        schedule: '* * * * *'
    }
];

const jobs = [
    {
        name: 'Price alert activation',
        path: './src/jobs/price_alert_activation.js',
        schedule: '0 */1 * * *'
    },
    {
        name: 'Price change detector',
        path: './src/jobs/price_change_detector.js',
        schedule: '0 */2 * * *'
    },
    {
        name: 'Refresh external products',
        path: './src/jobs/refresh_external_products.js',
        schedule: '30 */2 * * *'
    },
    {
        name: 'Refresh products',
        path: './src/jobs/refresh_products.js',
        schedule: '0 */3 * * *'
    }
];

const run = ({ name, path }) => {
    const start = Date.now();
    
    console.log(`[CRON] ${name} started`);

    execFile('node', [path], (error, stdout, stderr) => {
        if (error) {
            console.error(`[CRON] ${name} failed`, error);
            return;
        }

        if (stderr) {
            console.error(`[CRON] ${name} stderr:`, stderr);
        }

        console.log(
            `[CRON] ${name} finished in ${Date.now() - start}ms`
        );

        if (stdout) {
            console.log(stdout);
        }
    });
};

[...cron, ...jobs].forEach((task) => {
    nodeCron.schedule(
        task.schedule,
        () => run(task)
    )
});

console.log('[CRON] Scheduler started');
