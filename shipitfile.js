require('dotenv').config();

const APP_NAME = 'test-shipit';
const deploy_path = `/var/opt/${APP_NAME}`;
const repository = 'https://github.com/bmsrox/test-shipit.git';

const envFile = {
  master: '.env.production',
}

module.exports = shipit => {
  // Load shipit-deploy tasks
  //require('shipit-deploy')(shipit);
  require('shipit-local')(shipit);

  shipit.initConfig({
    default: {
      deployTo: deploy_path,
      repositoryUrl: repository,
      keepReleases: 3,
      npm: {
        installFlags: ['--production']
      }
    }
  });

  shipit.on('deploy:build', () => {
    shipit.start('deploy:dotenv');
  })

  shipit.on('deploy:published', () => {
    shipit.start('deploy:start');
  });

  shipit.blTask('deploy:test', async () => {
    shipit.log(process.env.APP);
  });

  //init
  shipit.blTask('deploy:start', ['deploy:test'], async () => {
    await shipit.start([
      'deploy:migration', 
      'deploy:runApp'
    ]);
  });

  shipit.blTask('deploy:dotenv', async () => {
    let dotenv = envFile[shipit.environment];
    await shipit.local(`cd ${shipit.localReleasePath} && cp ${dotenv} .env`);
    shipit.log('DotEnv has been set up!');
  });

  shipit.blTask('deploy:migration', async () => {
    let bin = 'node_modules/db-migrate/bin/db-migrate';
    try {
      await shipit.local(`cd ${shipit.releasePath} && ${bin} up`);
    } catch (error) {
      shipit.log('Migrations does not configured!');
    }
  });

  shipit.blTask('deploy:runApp', async () => {
     shipit.log('Starting App in ' + shipit.environment);
  });

}