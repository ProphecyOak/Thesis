# Vizzini

A programming language that looks like English.

```
> Say "Hello World!".
: Hello World!
```

This project was initially completed between Sep 2024 and May 2025 for my Honors Thesis. The pdf in the `Manuscript` folder is the paper associated with this work. I encourage any curious individuals to experiment with this project and take it in new directions.

## Instructions

Download and unzip the repository. Then in the `SayHelloWorld` folder, run the following commands:

```
npm i
npm run dev
```

## How to Add Your Own Words

First, define a word in `shell_lexicon.ts`. Basically it just involves making an XBar with the correct type and function definition. Then you can add any necessary frames to `parser.ts` to supply the necessary arguments to your word. Lastly, you can add tests to any of the test files to test that your changes work.

## Organization

- `react-root`
  - Contains the basic framework for the interface.
- `shell`
  - Contains the actual components for managing the shell.
  - Also contains the lexicon used for the shell and some of the testing.
- `structure`
  - Contains the files defining the behavior of XBars, XBar types, and the Lexicon.
- `tests`
  - Contains all of the various tests used to track the functionality of the language.
- `tools`
  - Contains the Parser (most important piece), the definitions of my test functions, and a helper for printing out trees.

## Known Issues

- The Show-Trees feature does not work well with block sentences, and can have confusing output.
