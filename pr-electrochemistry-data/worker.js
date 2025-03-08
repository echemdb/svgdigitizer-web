export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
    if (request.method == 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }
    if (request.method !== 'POST') {
      return new Response('Only POST requests allowed', { headers: corsHeaders, status: 405 })
    }

    const GITHUB_TOKEN = await env.GITHUB_TOKEN
    const GITHUB_OWNER = await env.GITHUB_OWNER
    const GITHUB_REPO = await env.GITHUB_REPO
    const BRANCH_NAME = `patch-${Date.now()}`
    const headers = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'user-agent': 'cloudflare worker',
    }

    try {
      const { files, commitMessage } = await request.json()
      if (!files || files.length === 0 || !commitMessage) {
        return new Response(JSON.stringify({ error: 'Missing files or commit message' }), {
          headers: corsHeaders,
          status: 400,
        })
      }

      const mainBranchRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/ref/heads/main`,
        {
          headers: headers,
        },
      )
      const mainBranchText = await mainBranchRes.text()
      let mainBranchData
      try {
        mainBranchData = JSON.parse(mainBranchText)
      } catch {
        return new Response(
          JSON.stringify({
            error: 'Invalid JSON from GitHub (main branch)',
            response: mainBranchText,
          }),
          { headers: corsHeaders, status: 500 },
        )
      }
      if (!mainBranchRes.ok)
        return new Response(
          JSON.stringify({ error: 'Failed to get main branch', githubResponse: mainBranchData }),
          { headers: corsHeaders, status: mainBranchRes.status },
        )
      const mainSha = mainBranchData.object.sha

      const branchRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ ref: `refs/heads/${BRANCH_NAME}`, sha: mainSha }),
        },
      )
      const branchText = await branchRes.text()
      let branchData
      try {
        branchData = JSON.parse(branchText)
      } catch {
        return new Response(
          JSON.stringify({
            error: 'Invalid JSON from GitHub (branch creation)',
            response: branchText,
          }),
          { headers: corsHeaders, status: 500 },
        )
      }
      if (!branchRes.ok)
        return new Response(
          JSON.stringify({ error: 'Failed to create branch', githubResponse: branchData }),
          { headers: corsHeaders, status: branchRes.status },
        )

      const treeItems = []
      for (const file of files) {
        const fileContent = btoa(unescape(encodeURIComponent(file.content))) // Base64 kodiert
        const blobRes = await fetch(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/blobs`,
          {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ content: fileContent, encoding: 'base64' }),
          },
        )
        const blobText = await blobRes.text()
        let blobData
        try {
          blobData = JSON.parse(blobText)
        } catch {
          return new Response(
            JSON.stringify({
              error: 'Invalid JSON from GitHub (blob creation)',
              response: blobText,
            }),
            { headers: corsHeaders, status: 500 },
          )
        }
        if (!blobRes.ok)
          return new Response(
            JSON.stringify({ error: 'Failed to upload file', githubResponse: blobData }),
            { headers: corsHeaders, status: blobRes.status },
          )

        treeItems.push({ path: file.filename, mode: '100644', type: 'blob', sha: blobData.sha })
      }

      const treeRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ base_tree: mainSha, tree: treeItems }),
        },
      )
      const treeText = await treeRes.text()
      let treeData
      try {
        treeData = JSON.parse(treeText)
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON from GitHub (tree creation)', response: treeText }),
          { headers: corsHeaders, status: 500 },
        )
      }
      if (!treeRes.ok)
        return new Response(
          JSON.stringify({ error: 'Failed to create tree', githubResponse: treeData }),
          { headers: corsHeaders, status: treeRes.status },
        )

      const commitRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/commits`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ message: commitMessage, tree: treeData.sha, parents: [mainSha] }),
        },
      )
      const commitText = await commitRes.text()
      let commitData
      try {
        commitData = JSON.parse(commitText)
      } catch {
        return new Response(
          JSON.stringify({
            error: 'Invalid JSON from GitHub (commit creation)',
            response: commitText,
          }),
          { headers: corsHeaders, status: 500 },
        )
      }
      if (!commitRes.ok)
        return new Response(
          JSON.stringify({ error: 'Failed to create commit', githubResponse: commitData }),
          { headers: corsHeaders, status: commitRes.status },
        )

      const updateBranchRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/${BRANCH_NAME}`,
        {
          method: 'PATCH',
          headers: headers,
          body: JSON.stringify({ sha: commitData.sha }),
        },
      )

      const prRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            title: `svgdigitizer-web: ${commitMessage}`,
            head: BRANCH_NAME,
            base: 'main',
            body: '',
          }),
        },
      )

      const prText = await prRes.text()
      let prData
      try {
        prData = JSON.parse(prText)
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON from GitHub (PR creation)', response: prText }),
          { headers: corsHeaders, status: 500 },
        )
      }
      if (!prRes.ok)
        return new Response(
          JSON.stringify({ error: 'Failed to create pull request', githubResponse: prData }),
          { headers: corsHeaders, status: prRes.status },
        )

      return new Response(
        JSON.stringify({ message: 'Pull request created!', githubResponse: prData }),
        { headers: corsHeaders, status: 201 },
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Error while processing request', details: error.toString() }),
        { headers: corsHeaders, status: 500 },
      )
    }
  },
}
