import { getInput, setOutput, setFailed } from '@actions/core'
import { context } from '@actions/github'
import { Octokit } from '@octokit/core'
import { OctokitResponse } from '@octokit/types'

const debug = isTrue(getInput('debug'))
const token = getInput('github_token', { required: true })

const ref = input('ref')
const repo = input('repo', context.repo.repo)
const owner = input('owner', context.repo.owner)
const environment = input('environment')

const requireContextsString = input('required_contexts', '[]')
let requiredContexts

try {
  requiredContexts = JSON.parse(requireContextsString)
} catch (e) {
  console.error(`Problem parsing the required_contexts input: ${requireContextsString}`)
  console.error('Defaulting to empty array: []')

  requiredContexts = []
}

let log = null

if (debug) {
  log = console
}

const client = new Octokit({ auth: token, log })

;(async () => {
  try {
    const { id, response } = await createDeployment()

    output('id', id)
    output('response', response)
  } catch (e) {
    setFailed(`error: ${e.stack}`)
  }
})()

async function createDeployment () {
  const resp = await client.request('POST /repos/:owner/:repo/deployments', {
    required_contexts: requiredContexts,
    owner,
    repo,
    ref,
    environment
  })

  checkResponse(resp)

  const response = resp.data
  const id = response.id

  return {
    id,
    response
  }
}

function checkResponse (resp: OctokitResponse<any>) {
  if (resp.status !== 201) {
    console.error(`Creating deployment failed: ${resp.status} - ${resp.data.error}`)
    throw new Error('Failed to create the deployment')
  }
}

function input (name: string, defaultValue?: string): string | null {
  let value = getInput(name)

  if (!value || value === '') {
    value = defaultValue
  }

  if (debug) {
    console.debug('got input', name, value)
  }

  return value
}

function output (name: string, value: string) {
  if (debug) {
    console.debug('outputting', name, value)
  }

  setOutput(name, value)
}

function isTrue (value: boolean | string): boolean {
  return true
}
