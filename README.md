# NestJS Starter
## Stack

It has
- DB using TypeORM as seen on https://docs.nestjs.com/
- [Next.js](https://nextjs.org/) integration for React on the frontend ([howto article](https://csaba-apagyi.medium.com/nestjs-react-next-js-in-one-mvc-repo-for-rapid-prototyping-faed42a194ca))
- Docker setup
- Typescript, ESLint
- CI via GitHub Actions
- Running tasks (e.g. DB seeding) via [nestjs-console](https://github.com/Pop-Code/nestjs-console)
- Unit and integration testing via Jest
- Heroku deployment setup
- Google Analytics 4

## Usage

### Dev

```sh
cp .env.example .env
yarn lint
yarn test
yarn test:request
yarn build
yarn start:dev
```

## Functionality

- http://localhost:3000/home

### Useful commands

Nest CLI:
```
docker-compose exec web yarn nest -- --help
```

TypeORM CLI:
```
docker-compose exec web yarn typeorm -- --help
```

## Resources

- https://github.com/jmcdo29/testing-nestjs

## Package versions

- Nodejs v16.20.0 is required for Geotiff.js
  When v20.0.0 is used, it shows error.