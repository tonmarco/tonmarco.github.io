# IC2S2 2027 conference website

## Features

- Mobile-first approach

### Interactive program

- We prioritize the ability to know when and how particular sessions/talks/posters/tutorials/keynotes are taking place.
- The ability to drill in for more details, making extensive use of sidebars:
  - Calendar overview versus daily view
  - Sessions overview versus detailed view for talks
- Conference ontology: distinguishing betwee talks and posters.
  - `Search bar`: High cardinality of posters compensated with a minimal search bar
- Pleasant aesthetics
- A small embedding app to visualize similarity among posters and talks.
- Survey to get feedback about usefulness of the embedding app (in the process, we also get some data about which embeddings people preferred to compared abstracts)!

## What do I do to replicate that conference website?

The main challenge is to get the data in the right format.

We use Typescript throughout the codebase. Our data are in the form of JSON, that we convert to typescripts.

Then, we have the following sheets/csvs types that we resolve to build the main program: `program`, `keynotes`, `tutorials`, `parallelSessions`, `posters`. We take this approach so that it is modular; we can show both information of `tutorials` on the main website, but still access the detailed information in the overview program via "hydration".

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.15.1 create --template minimal --types ts --add prettier tailwindcss="plugins:typography" sveltekit-adapter="adapter:static" --install npm ic2s2-svelte
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

# vcsi-skills
