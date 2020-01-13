# GitHub action to create a [deployment](https://developer.github.com/v3/repos/deployments/)

## Usage

```yml
name: yo
on:
  push:

jobs:
  yo:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v1
      - name: create deployment
        id: deployment
        uses: shareup/create-deployment-action@master
      - name: print debugging info
        run: |
          echo "deployment id: ${DEPLOYMENT_ID}"
        env:
          DEPLOYMENT_ID: ${{ steps.deployment.outputs.id }}
```

## Outputs

* `id`
* `response`
