import * as vscode from "vscode";
import { BugsPayload } from "../types/bugs";
import { getGravatarUrl } from "../utils";
import { BugCommentPayload } from "../types/bug-comment";

export async function bugDetailsPanel(bugId: number, context: vscode.ExtensionContext) {
  const iconPath = vscode.Uri.file(
    context.asAbsolutePath("assets/bugzilla.svg") 
  );

  const panel = vscode.window.createWebviewPanel(
    "bugDetails",
    `Bug #${bugId}`,
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true, // сохранение контекста при скрытии панели
    }
  );

  // Сначала устанавливаем HTML с сообщением о загрузке
  panel.iconPath = iconPath;
  panel.webview.html = loadingContent();

  try {
    const bugPromise = fetch(
      `https://bugzilla.altlinux.org/rest/bug/${bugId}`
    );
    const commentsPromise = fetch(
      `https://bugzilla.altlinux.org/rest/bug/${bugId}/comment`
    );
    const attachmentsPromise = fetch(
      `https://bugzilla.altlinux.org/rest/bug/${bugId}/attachment`
    );

    // Дожидаемся выполнения обоих промисов
    const [bugResponse, commentsResponse] = await Promise.all([
      bugPromise,
      commentsPromise,
    ]);

    if (!bugResponse.ok || !commentsResponse.ok) {
      throw new Error(
        `HTTP error! Status: ${bugResponse.status} or ${commentsResponse.status}`
      );
    }

    const bugDetails = (await bugResponse.json()) as BugsPayload;
    const commentsDetails =
      (await commentsResponse.json()) as BugCommentPayload;

    // получите путь к файлу стилей @primer/css в node_modules вашего расширения
    const primerCSSPath = vscode.Uri.joinPath(context.extensionUri, 'assets', 'primer.css');

    // Use a vscode URI to get the proper path format for including in webview
    const primerCSSWebviewUri = panel.webview.asWebviewUri(primerCSSPath);

    // Показываем содержимое с деталями и комментариями
    panel.webview.html = createBugDetailsContent(
      bugDetails,
      commentsDetails,
      bugId,
      primerCSSWebviewUri,
      panel.webview.cspSource 
    );
  } catch (error) {
    panel.webview.html = `Failed to load bug details: ${error}`;
  }
}


function createBugDetailsContent(
  bugDetails: BugsPayload,
  commentsDetails: BugCommentPayload,
  bugId: number,
  CSS: vscode.Uri, csp: string
) {
  const bug = bugDetails.bugs[0]; // Берем объект bug напрямую для простоты

  const bugComments = commentsDetails.bugs[bugId].comments;

  const commentsHtml = bugComments
    .map(
      (comment) => `
<div class="comment">
  <div class="comment-meta">
    <div class="avatar"><img src="${getGravatarUrl(comment.creator)}" /></div>
    <strong>${comment.creator}</strong>&nbsp; в ${comment.creation_time}
    <span class="comment-number">#${comment.count}</span>
  </div>
  <div class="comment-text">${comment.text}</div>
  ${comment.tags .map( (tag) => `<span class="Label Label--secondary mr-1"
    >${comment.attachment_id}</span
  >` ) .join("")}
</div>
`).join("");

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src ${csp} https:; script-src ${csp}; style-src ${csp} 'unsafe-inline';"
      />
      <style>
        body {
          font-family: "Helvetica Neue", Arial, sans-serif;
          background-color: #f4f5f7;
          margin: 0;
          padding: 20px;
        }
        .bug-report {
          background-color: #fff;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .bug-details {
          line-height: 1.6;
        }
        .comment {
          border-bottom: 1px solid #eee;
          padding: 15px 0;
        }
        .comment:last-child {
          border-bottom: 0;
        }
        .comment-meta {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .avatar {
          width: 40px;
          height: 40px;
          margin-right: 10px;
          border-radius: 50%;
          background-color: #ddd;
          overflow: hidden;
        }
        .comment-number {
          margin-left: auto;
          background: #f4f5f7;
          color: #666;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.8rem;
        }
        .comment-text {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          border-left: 4px solid #ccc;
          white-space: pre-line;
        }
        .comment-text code {
          display: block;
          padding: 10px;
          background-color: #eef;
          margin-top: 10px;
          font-family: monospace;
        }
        .new-comment {
          border-top: 1px solid #eee;
          padding-top: 20px;
          margin-top: 20px;
        }
        .new-comment textarea {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 10px;
          resize: vertical;
        }
        .new-comment button {
          background: #5cb85c;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="bug-report">
        <h1><a href="https://bugzilla.altlinux.org/${bug.id}">#${bug.id}</a> Bug Report:</h1>
        <div class="bug-details">
          <p><strong>Summary:</strong> ${bug.summary}</p>
          <p>
            <strong>Status:</strong> ${bug.status} ${bug.resolution ? "- " +
            bug.resolution : ""}
          </p>
          <p>
            <strong>Assigned To:</strong> Y${bug.assigned_to_detail.real_name}
            (${bug.assigned_to_detail.email})
          </p>
          <p><strong>Severity:</strong> ${bug.severity}</p>
          <p><strong>Priority:</strong> ${bug.priority}</p>
          <p><strong>Product:</strong> ${bug.product}</p>
          <p><strong>Component:</strong> ${bug.component}</p>
          <p><strong>Platform:</strong> ${bug.platform}</p>
          <p><strong>Version:</strong> ${bug.version}</p>
          <p><strong>Operating System:</strong> ${bug.op_sys}</p>
          <p>
            <strong>Created:</strong> ${new
            Date(bug.creation_time).toLocaleString()}
          </p>
          <p>
            <strong>Last Changed:</strong> ${new
            Date(bug.last_change_time).toLocaleString()}
          </p>
          <p>
            <strong>CC:</strong> ${bug.cc_detail .map((cc) => cc.real_name)
            .join(", ")}
          </p>
        </div>
      </div>
  
      <div class="comments">${commentsHtml}</div>
    </body>
  </html>
`;

}

function loadingContent() {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src https:; style-src 'unsafe-inline';"
      />
    </head>
    <body>
      <div id="loader" style="display: flex; justify-content: center">
        <p>Загрузка, ожидайте...</p>
      </div>
    </body>
  </html>
`;

}

