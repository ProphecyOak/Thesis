## Adding to the lexicon
To add to an existing category, create a new entry at the bottom of that category's lexicon file (i.e. `verbs.py`)

To add a new category, complete the following steps:
- Create a new file in the lexicon folder
- Add to the Parser and Semantics imports
- Add to the `.gram` file.
- Modify the Parser to replace and reinsert the terminals
- Add a case to the `getTypes` function in Semantics