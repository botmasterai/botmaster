---
chapter: false
date: 2016-10-29T19:55:42+01:00
icon: <i class="fa fa-list" aria-hidden="true"></i>
next: /next/path
prev: /prev/path
title: CHANGELOG
weight: 0
---

### PATCH: Botmaster 2.1.1

This patch fixes a bug whereby one couldn't instantiate a botmaster object that would use socket.io in all reasonably expected ways. See [here](https://github.com/jdwuarin/botmaster/pull/2) for a discussion.


### MINOR: Botmaster 2.1.0

This version adds support for socket.io bots within the botmaster core. This is the last
bot class that will be in the core

### MAJOR: Botmaster 2.0.0

In this new version, a lot of new things were added to Botmaster. A few others were removed.

#### Breaking Changes
If you were using SessionStore in version 1.x.x, you won't be able to anymore in version 2.x.x. They have been scratched for the far more common middleware design pattern common in so many other frameworks (e.g. express). Middleware can be hooked into right before receiving an update and right before sending out a message. It fits ideally with people wanting to setup session storage at these points.

#### Adding Slack
Support for Slack as the fourth channel supported by Botmaster has been added. Using the Events API, you can now send and receive messages on the platform.

#### get User info
If the platform supports it and the bot class you are using supports it too, you can now use the `bot.getUserInfo` method to retrieve basic information on a user, including their name and profile pic.

#### bug fixes
As with any release, a bunch of bugfixes were done.
