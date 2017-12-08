node('v2-slave'){
    step([$class: 'WsCleanup'])
    try
       {
          dir('node_modules'){
              deleteDir()
          }
          dir('dist'){
              deleteDir()
          }

          git branch: env.BRANCH_NAME, credentialsId: 'stoicbot-github-ssh', url: "git@github.com:sutoiku/lambda-ci-monkeykiller"

          stage name: 'Resolving dependencies', concurrency: 1
              sh("npm i")



          stage name: 'Deploying', concurrency: 1
              sh("node node_modules/grunt-cli/bin/grunt deploy")
              slackSend channel: SLACK_CI_CHANNEL, color: 'good', message: "Build Done : ${env.JOB_NAME}\nBranch : ${env.BRANCH_NAME} (<${env.BUILD_URL}|Open>)"
        }
        catch (error){
          slackSend channel: SLACK_CI_CHANNEL, color: 'danger', message: "Build failed : ${env.JOB_NAME}\nBranch : ${env.BRANCH_NAME} (<${env.BUILD_URL}|Open>)"
          throw error
        }
}
