# REACT_RU_BOT

A chat bot for [@react_ru](tg://@react_ru)

## Features

| Feature                       |
|-------------------------------|
| Spam removal (educated guess) |

### Spam removal

#### ❤️ Approach

I collected 11 (for now) examples of spam and trained [LogisticRegressionClassifier](https://github.com/NaturalNode/natural/blob/master/lib/natural/classifiers/logistic_regression_classifier.js) (from [natural](https://github.com/NaturalNode/natural))

If bot sees something that looks like spam it will:

* Remove message if it's sure that's spam
* Ask if that's actually spam if it's unsure

When receive answer, bot update internal classifier to not pass that message again

#### Motivation

Current antispam solutions offers some kind of CAPTCHA to every new member.

It's not very fair for most of the memers, so described approach are implemented.

#### Rationale

Evidence-based approach affects on really spammy messages

In false negative scenario bot reassuring itself by members of a group

False negative scenario are mitigated by confidence rate: if bot not sure if message is spam or not, it will ask from community

# CONTRIBUTING

❤️ PR's are welcome
