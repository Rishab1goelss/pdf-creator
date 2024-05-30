const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 5001;

app.get('/pdf', async (req, res) => {
	try {
		const referer = req.headers.referer;
		const cookieHeader = req.headers.cookie;

		const browser = await puppeteer.launch(
			process.env.NODE_ENV === 'production' && {
				executablePath: '/usr/bin/google-chrome',
				headless: 'new',
				ignoreDefaultArgs: ['--disable-extensions'],
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
			}
		);

		// Create a new page
		const page = await browser.newPage();

		if (cookieHeader) {
			const cookies = cookieHeader.split(';').map(cookie => {
				const [name, value] = cookie.split('=').map(c => c.trim());
				return { name, value, url: referer };
			});
			await page.setCookie(...cookies);
		}

		// Navigate to a website
		await page.goto(referer, {
			waitUntil: 'networkidle0',
		});
		const pdf = await page.pdf({
			format: 'A4',
			landscape: true,
			printBackground: true,
			scale: 0.7,
		});

		// Close the browser
		await browser.close();

		// return the pdf
		res.contentType('application/pdf');
		res.send(pdf);
		res.end();
		console.log('PDF generated successfully!');
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({
			error: 'An error occurred while scraping the data.',
		});
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
