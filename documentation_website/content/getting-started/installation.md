---
date: 2016-10-31T18:46:54Z
next: /getting-started/quickstart
prev: /getting-started/
title: Installation
toc: true
weight: 10
---

Make sure you have [Node.js](https://nodejs.org/en/) and npm installed on your machine. If you don't, I recommend using nvm to manage your node versions. Find out more about it [here](https://github.com/creationix/nvm/blob/master/README.markdown)

Once you have node, create a new project directory and go into it:

```bash
mkdir my_botmaster_project && cd my_botmaster_project
```

Make sure you initialize a node project in the new directory and going through the prompt by doing:

```bash
npm init
```

Finally, install the botmaster npm package.

```bash
npm install --save botmaster
```

That should do!
