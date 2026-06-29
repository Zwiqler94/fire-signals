SHORT_SHA=$(git rev-parse --short $GITHUB_SHA)
TAG_TEST="^refs/tags/.+$"
LATEST_TEST="^[^-]*$"
ARTIFACT_REGISTRY="https://us-central1-npm.pkg.dev/jlz-portfolio/angular-libraries/"

if [[ $GITHUB_REF =~ $TAG_TEST ]]; then
    OVERRIDE_VERSION=${GITHUB_REF/refs\/tags\//}
    if [[ $OVERRIDE_VERSION =~ $LATEST_TEST ]]; then
        NPM_TAG=latest
    else
        NPM_TAG=next
    fi;
else
    OVERRIDE_VERSION=$(node -e "console.log(require('./package.json').version)")-canary.$SHORT_SHA
    NPM_TAG=canary
fi;

npm --no-git-tag-version --allow-same-version -f version $OVERRIDE_VERSION

npm run build &&
    printf "npm publish . --registry %s --@zwiqler94:registry=%s --tag %s\n" "$ARTIFACT_REGISTRY" "$ARTIFACT_REGISTRY" "$NPM_TAG" > ./dist/publish.sh &&
    chmod +x ./dist/publish.sh
