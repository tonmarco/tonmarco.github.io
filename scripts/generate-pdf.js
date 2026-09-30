import puppeteer from 'puppeteer';
import { spawn, execSync } from 'child_process';

const PORT = 4799;
const URL = `http://localhost:${PORT}/program/print`;
const OUTPUT = 'static/files/program-overview.pdf';

// Build first
console.log('Building site...');
execSync('npm run build', { stdio: 'inherit' });

// Start preview server
console.log('Starting preview server...');
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
	stdio: 'pipe',
	shell: true
});

// Wait for server to be ready
async function waitForServer(url, retries = 20) {
	for (let i = 0; i < retries; i++) {
		try {
			await fetch(url);
			return;
		} catch {
			await new Promise((r) => setTimeout(r, 1000));
		}
	}
	throw new Error('Server did not start in time');
}

async function generate() {
	try {
		await waitForServer(URL);
		console.log('Server is ready.');

		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();

		console.log(`Navigating to ${URL}...`);
		await page.goto(URL, { waitUntil: 'networkidle0' });

		// Remove no-print elements
		await page.evaluate(() => {
			document.querySelectorAll('.no-print').forEach((el) => el.remove());
		});

		console.log(`Generating PDF to ${OUTPUT}...`);
		await page.pdf({
			path: OUTPUT,
			landscape: true,
			format: 'A4',
			printBackground: true,
			margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }
		});

		await browser.close();
		console.log(`✓ PDF generated: ${OUTPUT}`);
	} finally {
		server.kill();
	}
}

generate().catch((err) => {
	console.error('PDF generation failed:', err);
	server.kill();
	process.exit(1);
});
