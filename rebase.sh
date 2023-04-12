#!/bin/bash

# Little script to quickly rebase one branch onto another because I'm lazy
# I wrote this all on my phone please be both extremely disgusted while also very proud

# Check argument count
if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "USAGE: rebase.sh <FROM> [TO]" >&2
  exit 1
fi

FROM_BRANCH="$1"
TO_BRANCH="$2"

# Check if we're in a valid git repository
git status > /dev/null 2>&1
if [ "$?" -ne 0 ]; then
  echo "Git errored, you're probably not in a valid git repisitory." >&2
  exit 2
else
  echo "You're in a valid git directory!"
fi

# Remember what branch we're currently on
CURRENT_BRANCH="$(git branch --show-current)"

# Check if the working tree is dirty
if [ -n "$(git status -s)" ]; then
  echo "Your working tree is NOT clean, please make sure it is clean before trying to rebase!" >&2
  exit 3
else
  echo "Your working tree is clean!"
fi

# Check if we're in detatched HEAD state
if [ -z "$CURRENT_BRANCH" ]; then
  # If the user did not provide TO_BRANCH, throw an error
  if [ -z "$TO_BRANCH" ]; then
    echo "You can't rebase onto a detatched HEAD, switch to the branch you would like to rebase onto, or provide FROM" >&2
    exit 4
  fi
fi

# Check if we're trying to rebase from the current branch we're on
if [ "$CURRENT_BRANCH" == "$FROM_BRANCH" ]; then
  echo "You're trying to rebase the currebt branch onto itself!" >&2
  exit 5
fi

# Check if we need to switch to TO_BRANCH
if [ -n "$TO_BRANCH" ]; then
  if [ "$TO_BRANCH" == "$CURRENT_BRANCH" ]; then
    echo "Already on target branch, no need to switch!"
  else
    echo "Switching to target branch '$TO_BRANCH'"
    git checkout $TO_BRANCH > /dev/null 2>&1
    # Check if git errored
    if [ "$?" -ne 0 ]; then
      echo "Git failed to checkout the target branch '$TO_BRANCH'!" >&2
      exit 1
    else
      echo "Successfully checked out target branch '$TO_BRANCH'"
      # Update CURRENT_BRANCH
      CURRENT_BRANCH="$(git branch --show-current)"
    fi
  fi
fi

# Update local copies of remote branches
echo "Updating local copies of remote branches..."
git fetch --all > /dev/null 2>&1
# Check if git errored while updating local copies of remote branches
if [ "$?" -ne 0 ]; then
  echo "Git failed to update local copies of remote branches!" >&2
  exit 1
else
  echo "Successfully updated local copies of remote branches!"
fi

# Update current branch
echo "Updating local branch..."
git pull > /dev/null 2>&1
# Check if git errored while updating the current branch
if [ "$?" -ne 0 ]; then
  echo "Git failed to update the current branch!" >&2
  exit 1
else
  echo "Successfully updated tbe current branch!"
fi

# (Finally) Do the rebase
echo "(Finally) Rebasing '$FROM_BRANCH' onto '$CURRENT_BRANCH'..."
git rebase $FROM_BRANCH $CURRENT_BRANCH > /dev/null 2>&1
# Check if git errored while doing the rebase
if [ "$?" -ne 0 ]; then
  echo "Git failed to rebase '$FROM_BRANCH' onto '$CURRENT_BRANCH'!" >&2
  exit 1
else
  echo "Successfully rebased '$FROM_BRANCH' onto '$CURRENT_BRANCH'!"
fi

# Push the rebased branch to the remote repository
echo "Pushing the rebased branch to the remote repository..."
git push > /dev/null 2>&1
# Check if git errored while pushing the rebased branch to the remote repository
if [ "$?" -ne 0 ]; then
  echo "Git failed to push the rebased branch to the remote repository!" >&2
  exit 1
else
  echo "Successfully pushed the rebased branch to the remote repository!"
fi

echo "Done!"
exit 0
