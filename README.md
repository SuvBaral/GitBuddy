# Git Simple — Team Explorer for VS Code + AI Git Commands

Git Simple is a Visual Studio Team Explorer-style Git panel for VS Code that revolutionizes how you interact with Git. Instead of remembering complex git commands, simply type natural language instructions like "switch to main" or "create a feature branch".

## Features

- **Natural Language Git Commands**: Type instructions in plain English instead of memorizing git syntax
- **Risk Classification**: Automatic detection and warnings for high-risk operations (force push, hard reset, etc.)
- **GitHub Copilot Integration**: Seamless AI-powered suggestions and auto-completion for git workflows
- **Blazor-powered UI**: Modern, responsive interface built with Blazor WebAssembly for lightning-fast interactions
- **Team Explorer Style**: Familiar interface inspired by Visual Studio's Team Explorer for a smooth learning curve
- **Offline Support**: Works offline with built-in command recognition and fallback support
- **Safety First**: Configurable confirmations and automatic backups for dangerous operations

## Installation

1. Install VS Code 1.90 or later
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Search for "Git Simple"
5. Click Install

Or download directly from the [VS Code Marketplace](https://marketplace.visualstudio.com)

## Usage

### Basic Commands

Simply open the Git Simple panel from the activity bar and type natural language commands:

```
switch to main          → Checks out the main branch
create feature/login    → Creates and checks out a new branch
merge develop           → Merges develop into current branch
commit my changes       → Stages and commits all changes
push                    → Pushes commits to remote
pull                    → Pulls latest changes from remote
```

### Keyboard Shortcut

Press `Ctrl+Shift+G Ctrl+Shift+N` to open the natural language command input directly.

### Configuration

Access settings via VS Code's preferences (Ctrl+,) and search for "Git Simple":

- **AI Provider**: Choose between Copilot, Anthropic, or offline mode
- **Confirm Moderate Risk**: Enable/disable confirmations for merge, rebase, and checkout operations
- **Auto Backup on Dangerous**: Automatically stash changes before risky operations

## Requirements

- VS Code 1.90 or later
- Git installed and configured on your system
- For Copilot features: GitHub Copilot extension for VS Code

## Screenshots

[Screenshots section - screenshots will be added to the published extension]

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "feat: describe your changes"`
5. Push to your fork
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing documentation and FAQs
- Contact the maintainer

## Acknowledgments

Built with TypeScript, Blazor, and VS Code's Extension API.

---

**Note**: Git Simple is a third-party VS Code extension and is not affiliated with Microsoft or GitHub.
