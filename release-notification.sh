#!/bin/bash

WEB_HOOK_URL=$1
WEB_URL=$2

GIT_MESSAGE=$(git log -1 --pretty=%B | sed ':a;N;$!ba;s/\n/\n\n/g')

curl -d \
   '{
      "summary": "notification",
      "title": "A new version has been deploy",
      "text": "'"$GIT_MESSAGE"'",
      "potentialAction": [
         {
            "@type": "OpenUri",
            "name": "View Site",
            "targets": [
               { "os": "default", "uri": "'$WEB_URL'" }
            ]
         }
      ]
   }' \
   $WEB_HOOK_URL