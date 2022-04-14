import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { mkdirP, mv } from "@actions/io";
import * as glob from "@actions/glob";
import * as github from "@actions/github";

async function main() {
	
	try {
		const context = github.context;
		var workspace = process.env.GITHUB_WORKSPACE;
		core.info(`Building and testing solution (ref: ${context.ref})...`);
		core.info(`Working directory: ${workspace}...`);
		core.info("(1/6) Install cross-env");
		await exec(`npm i -g cross-env`);
		core.info("(2/6) Install");
		await exec(`npm ci`);
		//Build UAT
		core.info("(3/6) Build");
		await exec(`npm run uat-bundle`);
		core.info("(4/6) Test");
		await exec(`npm run test`);
		core.info("(5/6) Package");
		await exec(`npm run uat-package-solution`);
		core.info("(6/6) Copy UAT artifact to UAT folder");
		//Make UAT folder
		await mkdirP(`${workspace}\\sharepoint\\solution\\UAT`);
		//Find sppkg
		const pattern = `${workspace}\\*.sppkg`;
		const globber = await glob.create(pattern);
		const uatfiles = await globber.glob()
		for(var i = 0; i < uatfiles.length; i++) {
			core.info(`Found sppkg: ${uatfiles[i]} - moving to UAT folder`);
			await mv(uatfiles[i], `${workspace}\\sharepoint\\solution\\UAT`);
		}
		core.info(`✅ complete`);
		//Build PROD
		core.info("(1/4) Build");
		await exec(`npm run prod-bundle`);
		core.info("(2/4) Test");
		await exec(`npm run test`);
		core.info("(3/4) Package");
		await exec(`npm run prod-package-solution`);
		core.info("(4/4)Copy PROD artifact to PROD folder");
		//Find sppkg
		await mkdirP(`${workspace}\\sharepoint\\solution\\PRODUCTION`);
		const prodfiles = await globber.glob()
		prodfiles.forEach(file => {
			core.info(`Found sppkg: ${file} - moving to PRODUCTION folder`);
			mv(file, `${workspace}\\sharepoint\\solution\\PRODUCTION`);
		});
		core.info(`✅ complete`);

	} catch (err) {
		core.error("❌ Failed");
		core.setFailed(err.message);
	}
}

main();
