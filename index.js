const puppeteer = require("puppeteer");
const scrollPageToBottom = require("puppeteer-autoscroll-down");
const fs = require("fs");

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://myanimelist.net/anime.php", { waitUntil: "load" });

    // get all genre
    const allGenre = await page.$eval(".genre-link", async element => {
      const arr = [];
      for (const genre of element.querySelectorAll("a.genre-name-link")) {
        const genreInnerHTML = genre.innerHTML.split("(")[0];
        const numberOfAnime = +genre.innerHTML
          .split("(")[1]
          .split(",")
          .join("")
          .slice(0, -1);
        console.log(genreInnerHTML);
        const formatedGenre = genreInnerHTML
          .trim()
          .split(" ")
          .map(value => value[0].toUpperCase() + value.slice(1))
          .join("");

        arr.push({ name: formatedGenre, numberOfAnime, url: genre.href });
      }
      return arr;
    });

    // get all anime
    for (const genre of allGenre) {
      let numberOfPages = Math.ceil(genre.numberOfAnime / 100);
      const allAnime = [];

      while (numberOfPages > 0) {
        await page.goto(`${genre.url}?page=${numberOfPages}`, { waitUntil: "load" });

        await page.setViewport({
          width: 1200,
          height: 800,
        });

        // Scroll to the very top of the page
        await page.evaluate(_ => {
          window.scrollTo(0, 0);
        });

        // Scroll to the bottom of the page with puppeteer-autoscroll-down
        await scrollPageToBottom(page);

        const allAnimeOfPage = await page.$$eval(".seasonal-anime", async elements => {
          const arr = [];
          for (const element of elements) {
            const title = element.querySelector(".link-title").innerHTML;
            const synopsis = element.querySelector(".synopsis .preline").innerHTML;
            const img = element.querySelector("img").getAttribute("src");
            arr.push({ title, synopsis, img });
          }
          return arr;
        });
        allAnime.push(...allAnimeOfPage);
        numberOfPages--;
      }

      await fs.writeFileSync(`./database/${genre.name}.json`, JSON.stringify(allAnime));
    }

    console.log(allGenre);

    await browser.close();
  } catch (e) {
    console.log(e);
  }
})();
