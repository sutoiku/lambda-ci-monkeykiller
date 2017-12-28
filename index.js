const AWS = require('aws-sdk'),
  debug = require('debug')('monkeykiller'),
  SlackWebhook = require('slack-webhook');
const region = 'us-west-1',
  webhookUrl = process.env.SLACK_WEBHOOK_URL,
  slackChannel = process.env.SLACK_WEBHOOK_CHANNEL || '#general';

const ec2 = new AWS.EC2({
  region
});

const {
  MAX_AGE_DAYS,
  TAG_TO_KILL,
  ODDS
} = process.env;

const params = {
  Filters: [{
      Name: 'instance-state-name',
      Values: [
        'running'
      ],
    },
    {
      Name: 'tag:Name',
      Values: [
        TAG_TO_KILL
      ],
    },
  ]
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.handler = (event, context, callback) => {
  debug('Execution starts', event);
  ec2
    .describeInstances(params)
    .promise()
    .then((instances) => {
      if(!instances || instances.Reservations.length===0){
        return Promise.resolve(null);
      }
      const foundInstance = instances.Reservations[0].Instances[0];
      debug(`Instance found: ${foundInstance.InstanceId}`);

      const ageDays = (Date.now() - new Date(foundInstance.LaunchTime).getTime()) / 1000 / 60 / 60 / 24;
      if (ageDays > MAX_AGE_DAYS) {
        debug(`The machine is ${ageDays} days old. Will be terminated.`);
        return foundInstance;
      }
      const chances = getRandomInt(1, ODDS);
      //the machine will die one time on  <ODDS>
      if (chances === 1) {
        debug(`The machine is unlucky. Will be terminated.`);
        return foundInstance;
      }
      debug(`Nobody gets terminated.`);

      return null;
    })
    .then((instance) => {
      if (instance) {
        const terminateParams = {
          InstanceIds: [instance.InstanceId],
        };
        return ec2.terminateInstances(terminateParams).promise();
      }
      return Promise.resolve(null)
    }).then((termination) => {
      if (termination) {
        const message = {
          "username": "MonkeyKiller",
          "icon_url": "http://www.designdazzling.com/wp-content/uploads/2013/02/cartoon-tuts-3031.jpg",
          "text": `I terminated the ${TAG_TO_KILL} instance.`,
          "channel": slackChannel
        };
        const slack = new SlackWebhook(webhookUrl);

        return slack
          .send(message);
      }
      return Promise.resolve(null)

    }).then(()=>{callback(null)});
};
