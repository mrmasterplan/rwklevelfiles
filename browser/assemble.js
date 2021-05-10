
const fs = require('fs')
const script = fs.readFileSync('dist/app.js','utf-8')

fs.writeFileSync('rwk.html',`<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html><body><script>${script}</script></body></html>`)