#!/usr/bin/env bash

serverless logs --tail -f app --stage prod --vault-address=https://v.disc.gg  --vault-role-id=f6dbc2d7-de4e-5f75-dac3-448aa5c8f0bc --vault-secret-id=f1a910df-f3df-0b16-ff1f-db3a474ff0f3
