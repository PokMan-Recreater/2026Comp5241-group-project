import {createRepo,runGit} from './git-sim.js';

/** A fresh sandbox repository: nothing exists until the learner runs git init. */
export const newSandboxRepo=()=>createRepo();

/**
 * Example commands in the order a small project would use them, so a learner can
 * load one and see what it changes instead of starting from a blank prompt.
 * The file itself comes from the working-tree editor beside the terminal.
 * @type {[string, string[], string][]}
 */
export const gitSandboxExamples=[
 ['init',['Create the repository','创建仓库','建立倉庫'],'git init'],
 ['status',['See what Git reports','查看 Git 报告的状态','查看 Git 報告的狀態'],'git status'],
 ['add',['Stage every change','暂存所有改动','暫存所有改動'],'git add .'],
 ['commit',['Record the staged snapshot','记录已暂存的快照','記錄已暫存的快照'],'git commit -m "Initial version"'],
 ['branch',['Start a branch for one change','为一个改动建立分支','為一個改動建立分支'],'git switch -c feature/form'],
 ['log',['Read the history as a graph','用图形阅读提交历史','用圖形閱讀提交歷史'],'git log --oneline --graph --all'],
 ['diff',['Inspect an unstaged change','查看未暂存的改动','查看未暫存的改動'],'git diff'],
 ['stash',['Set work aside','把工作暂存起来','把工作暫存起來'],'git stash'],
 ['remote',['Connect a remote','连接远程仓库','連接遠端倉庫'],'git remote add origin https://example.edu/team/project.git'],
 ['push',['Publish a branch','发布一个分支','發布一個分支'],'git push -u origin main'],
 ['help',['List the commands this sandbox runs','列出沙盒支持的命令','列出沙盒支援的指令'],'git help']
];

/** Runs one typed command in the sandbox and returns the next repository plus what it printed. */
export function sandboxStep(repo,input){
 const {repo:next,output,mistake}=runGit(repo,input);
 return {repo:next,output,mistake};
}

/** The terminal text for a sandbox repository. */
export const sandboxTranscript=repo=>(repo.transcript??[]).join('\n');
