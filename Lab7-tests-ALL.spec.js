//Marchenko Rodion FB-23 https://kpi.ua Playwright website-tests.

// @ts-check
const { test, expect, Page, TestInfo } = require('@playwright/test');


//Перевірка завантаження головної сторінки
test('1. Перевірка завантаження головної сторінки', async ({ page }) => {
	const response = await page.goto('https://kpi.ua');
	expect(response.status()).toBe(200);
});


//Перевірка коректності HTTP → HTTPS перенаправлення
test('2. Перевірка HTTP → HTTPS перенаправлення', async ({ page }) => {
	const response = await page.goto('http://kpi.ua');
	expect(response.status()).toBe(200); // Перевірка на перенаправлення на HTTPS
	expect(page.url()).toBe('https://kpi.ua/'); // Перевірка, що URL змінився на HTTPS
});


//Тестування роботи меню навігації
test('3. Тестування роботи меню навігації', async ({ page }) => {
    test.setTimeout(60_000);
	await page.goto('https://kpi.ua');
    var Link;

	//Перевірка вкладки "Університет"
	Link = await page.locator('a[href="/about"]');
	await Link.click();
	expect(await page.title()).toContain('Про університет');

	//Перевірка вкладки "Вступ"
	Link = await page.locator('a[href="/admission"]');
	await Link.click();
	expect(await page.title()).toContain('Вступ в КПІ');

	//Перевірка вкладки "Освіта"
	Link = await page.locator('a[href="/education"]');
	await Link.click();
	expect(await page.title()).toContain('Освіта');

	//Перевірка вкладки "Наука"
	Link = await page.locator('a[href="/science"]');
	await Link.click();
	expect(await page.title()).toContain('Наука та інновації');

	//Перевірка вкладки "Студентство"
	Link = await page.locator('a[href="/kpi_students"]');
	await Link.click();
	expect(await page.title()).toContain('Студентське життя');
});


//Перевірка внутрішніх посилань
expect.extend({
  async toBeAnyOf(received, ...possibilities) {
    if (possibilities.includes(received)) {
      return {
        message: () => "passed",
        pass: true,
      };
    }

    return {
      message: () =>
        `failed: '${received}' was not any of ${possibilities}`,
      pass: false,
    };
  },
});

test('Перевірка внутрішніх посилань', async ({ page }) => {
    test.setTimeout(60_000);
	await page.goto('https://kpi.ua');
	const links = await page.locator('a[href^="/"]'); // Всі внутрішні посилання
	for (let i = 0; i < await links.count(); i++) {
		const link = links.nth(i);
		const href = await link.getAttribute('href');
		const response = await page.goto(`https://kpi.ua${href}`);
		expect(response.status()).toBeAnyOf(200, 304)
	}
});


//Тестування адаптивності сторінки
test('5. Тестування адаптивності сторінки', async ({ page }) => {
	await page.goto('https://kpi.ua');
	await page.setViewportSize({ width: 1200, height: 800 });
	expect(await page.isVisible('header')).toBe(true); // Перевірка, чи видимий header
	await page.setViewportSize({ width: 375, height: 667 });
	expect(await page.isVisible('header')).toBe(true);
});


//Тестування часу завантаження сайту
test('6. Тестування часу завантаження сайту', async ({ page }, TestInfo) => {
	await page.goto('https://kpi.ua', {timeout: 3000});

	//Отримуємо дані про час завантаження з API браузера
    const [GetPerformanceTiming] = await page.evaluate(() => {
        const [timing] = performance.getEntriesByType('navigation');
        return [timing];
    });

	//Вираховуємо час завантаження
    const startToLoadEventEnd = GetPerformanceTiming.loadEventEnd - GetPerformanceTiming.startTime;
    //Додаємо інформацію у звіт тесту
    test.info().annotations.push({ type: 'Performance', description: `"${TestInfo.project.name}" - Site start to load time: ${startToLoadEventEnd}ms` });
});


//Перевірка наявності всіх основних елементів на головній сторінці
test('7. Перевірка наявності всіх основних елементів на головній сторінці', async ({ page }) => {
	await page.goto('https://kpi.ua');

	const logo = page.locator('#site-branding'); //Логотип
	const search = page.locator('#srch'); //Пошук
    const mainmenu = page.locator('#primary-menu-wrapper'); //Меню
	const news = page.locator('#frontpagenews'); //Новини
	const announcements = page.locator('#block-thex-views-block-announcements-block-1'); //Оголошення
	const videocontent = page.locator('#vfront'); //Відео
	const navigation = page.locator('#block-thex-mainnavigation'); //Навігація
	const regionprojects = page.locator('#region-projects'); //Корисна інформація
	const projects = page.locator('#projects'); //Проекти та ініціативи

	//Перевіримо, чи видно елементи сайту на різних розмірах екрану
    await page.setViewportSize({ width: 1200, height: 800 });
    await logo.isVisible();
	await search.isVisible();
	await mainmenu.isVisible();
	await news.isVisible();
	await announcements.isVisible();
	await videocontent.isVisible();
	await navigation.isVisible();
	await regionprojects.isVisible();
    await projects.isVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await logo.isVisible();
	await search.isVisible();
	await mainmenu.isVisible();
	await news.isVisible();
	await announcements.isVisible();
	await videocontent.isVisible();
	await navigation.isVisible();
	await regionprojects.isVisible();
    await projects.isVisible();

});


//Тестування доступності сайту
test('8. Тестування доступності сайту', async ({ page }) => {
	await page.goto('https://kpi.ua');

	//Перевірка наявності анотацій до зображень
    for (const Img of await page.getByRole('img').all())
        await expect(Img).toHaveAttribute('alt');

	//Автоматизоване тестування доступності за стандартами
    const AccessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(AccessibilityScanResults.violations).toEqual([]);
});


test('9. Перевірка завантаження сторінок іншими мовами', async ({ page }) => {
	await page.goto('https://kpi.ua');

    const Link = await page.locator('a[href="/en/"]');
	await Link.click();
    
    const html = await page.locator('html');
    await expect(html).toHaveAttribute("lang", RegExp("^en", "i"));

});


//Перевірка завантаження зовнішніх ресурсів
test('10. Перевірка завантаження зовнішніх ресурсів', async ({ page }) => {
	await page.goto('https://kpi.ua');

    const resourceTimingJson = await page.evaluate(() =>
        JSON.stringify(window.performance.getEntriesByType('resource')))

    const resourceTiming = JSON.parse(resourceTimingJson)
    console.log(resourceTiming)
    for (const i of resourceTiming) {
      expect((i.responseEnd - i.fetchStart) < 3000).toBeTruthy()
    }

});







