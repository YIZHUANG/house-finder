<h1 align="center">Welcome to house-finder 👋</h1>
<p>
  <a href="https://github.com/YIZHUANG">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" target="_blank" />
  </a>
</p>

> A task scheduler runs every now and then to automatically find apartments instead of doing it manully everyday.
Tech: Azure function, Docker, Puppeteer, S3.

### 🏠 [Homepage](https://github.com/YIZHUANG)

## Steps

1. A function gets triggered on a timer.
2. Gets existing data from S3 bucket.
3. Goes to website 1, scrap all data.
4. Compares with the existing data from S3, and remove duplicates to reduce overhead and only keep the new ones.
5. Makes api calls to binmap to filter out unwanted data.
6. Goes to website 2, repeat steps from 4 - 5.
7. Upload both the latest data and old data to S3, so in the future don't scrap them again.
8. Send email only with the latest data.


## Install

```sh
npm install
```

## Usage

```sh
npm run start
```

## Run tests

```sh
npm run test
```

## Author

👤 **YIZHUANG**

- Github: [@YIZHUANG](https://github.com/YIZHUANG)

## Show your support

Give a ⭐️ if this project helped you!
