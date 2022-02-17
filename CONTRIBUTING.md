## Pull requests
Contributions in the form of pull requests are accepted, but keep in mind that the quality and maintainability of the project is the most important.
Therefore, you should adhere to the existing code style, described in [in a later section](https://github.com/Daxanius/arachniguesser/blob/master/CONTRIBUTING.md#styleguide).
Commenting your code is required, although you don't have provide documentation for self-explanatory or trivial pieces of code.

In addition to this you should make sure that you supply a clear and concise explanation of what your pull request entails.
From this explanation one should be able to understand the work you have done, what it accomplishes and how it functions.

### Styleguide
To keep this section from getting unnecessarily large only the most important styles are included.
  
Indentation:
- Spaces for indentation
- Indent size: `4`

Naming:
- Types and namespaces: `UpperCamelCase`
- Interface: `IUpperCamelCase`
- Type parameters: `TUpperCamelCase`
- Methods: `UpperCamelCase`
- Properties: `UpperCamelCase`
- Events: `UpperCamelCase`
- Local variables: `lowerCamelCase`
- Local constant: `UPPER_CASE_SNAKE_CASE`
- Parameters: `lowerCamelCase`
- Fields (not private): `UpperCamelCase`
- Instance fields (private): `_lowerCamelCase`
- Static field (private): `_lowerCamelCase`
- Constant fields: `UPPER_CASE_SNAKE_CASE`
- Static readonly fields: `UpperCamelCase`
- Enum members: `UpperCamelCase`
- Local functions: `UpperCamelCase`
- All other entities: `UpperCamelCase`

Braces:
- Always use braces for `if`, `for`, `while` and similar statements
- Braces should always be placed at the end of the line

Spaces:
- Use spaces around the parenthesis of statements like: `if`, `for`, and `while`
- Don't use spaces within parenthesis of statements like: `if`, `for`, and `while`
- Don't use spaces before commas, but do use spaces after commas

In all other cases, please try to find an example in the existing code and try to adhere to the style used there.
If no such example can be found, use the most logical style for the context.
