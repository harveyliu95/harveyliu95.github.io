
var strGithubIssuecommentUrl = "https://api.github.com/repos/liutongl5/QMark-API/issues/2/comments";

$().ready(docReady);


function docReady() {
	$("#buttonRetrieve").click(retrieveQMark);
}

function retrieveQMark() {
	var userId = $("#inputQingmangUID")[0].value;
	var userSecret = $("#inputQingmangSecret")[0].value;
	var strPayload = "userId="+userId+"&userSecret="+userSecret;
	if ( $("#inputJsonCheckbox")[0].checked ) {
		strPayload += "&json=True";
	} 
	if ( $("#inputHtmlCheckbox")[0].checked ) {
		strPayload += "&html=True";
	}

	var strGithubToken = $("#inputGithubToken")[0].value;

	if (userId != "") {
		postIssuecomment(strPayload, strGithubToken);
	}
}

function postIssuecomment(strPayload, strGithubToken) {

	var ajaxPost = $.ajax({
		method: "POST",
		url: strGithubIssuecommentUrl,
		headers: {
			Accept: "application/vnd.github.v3+json",
			Authorization: "token "+strGithubToken
		}, 
		data: JSON.stringify({"body": strPayload})
	});
	ajaxPost.done( function (ajaxPostResponse) {
		readIssuecomment(ajaxPostResponse, strGithubToken);
	} );
	ajaxPost.fail( function(event) {
		console.log("Fail to post Issuecomment: "+event.responseText);
	} );
}

function readIssuecomment(ajaxPostResponse, strGithubToken) {

	var strTimestamp = "";
	var strReadUrl = "";

	if ( (ajaxPostResponse.constructor == Object) && ("created_at" in ajaxPostResponse) ) {
		strTimestamp = ajaxPostResponse["created_at"];
		strReadUrl = ajaxPostResponse["issue_url"]+"/comments";
	} else {
		timeNow = new Date();
		strTimestamp += timeNow.getFullYear() + "-";
		strTimestamp += (timeNow.getMonth()+1).toString().padStart(2, "0") + "-";
		strTimestamp += ( timeNow. getDate() ).toString().padStart(2, "0") + "T";
		strTimestamp += ( timeNow.getHours() ).toString().padStart(2, "0") + ":";
		strTimestamp += ( timeNow.getMinutes() ).toString().padStart(2, "0")+":";
		strTimestamp += ( timeNow.getSeconds() ).toString().padStart(2, "0")+"Z";
		strReadUrl = strGithubIssuecommentUrl;
	}
	
	strReadUrl += "?since="+strTimestamp;
	console.log(strReadUrl);

	var readSuccess = false;

	var ajaxRead = $.ajax({
		method: "GET",
		url: strReadUrl,
		headers: {
			Accept: "application/vnd.github.v3+json",
			Authorization: strGithubToken
		}
	});

	ajaxRead.done( function (data) {
		// console.log(data);
		if ( Array.isArray(data) ) {
			for (var i=0; i < data.length; i++) {
				issuecomment = data[i];
				if (issuecomment["user"]["login"].startsWith("github")) {
					// Find the comment created by github-actions[bot]
					readSuccess = true;
					var jsonCommentBody = JSON.parse(issuecomment["body"]);
					if ("json" in jsonCommentBody) {
						$("#divQMarkJson").html(jsonCommentBody["json"]);

						var blobQMarkJson = new Blob([jsonCommentBody["json"]], {type: "application/json"});
						$("#aDownloadJson")[0].href = URL.createObjectURL(blobQMarkJson);
						$("#aDownloadJson")[0].download = "QMark-"+strTimestamp+".json";
						$("#aDownloadJson").show();
					} else {
						$("#aDownloadJson").hide();
					}
					if ("html" in jsonCommentBody) {
						$("#divQMarkHtml").html(jsonCommentBody["html"]);
						$("#divQMarkHtml").show();
						// console.log(jsonCommentBody["html"]);

						var blobQMarkHtml = new Blob([jsonCommentBody["html"]], {type: "text/html"});
						$("#aDownloadHtml")[0].href = URL.createObjectURL(blobQMarkHtml);
						$("#aDownloadHtml")[0].download = "QMark-"+strTimestamp+".html";
						$("#aDownloadHtml").show();
					} else {
						$("#divQMarkHtml").hide();
						$("#aDownloadHtml").hide();
					}
					break;
				}
			}
		}

		if (readSuccess) {
			deleteIssuecomment(ajaxPostResponse, strGithubToken);
		} else {
			setTimeout(function() {
				console.log("Retrying...");
				readIssuecomment(ajaxPostResponse, strGithubToken);
			}, 10*1000);
		}

	} );
	ajaxRead.fail( function (data) {
		console.log("Fail to read Issuecomment: "+data);
	} );
}

function deleteIssuecomment(ajaxPostResponse, strGithubToken) {
	if ( (ajaxPostResponse.constructor == Object) && ("url" in ajaxPostResponse) ) {
		strDeleteUrl = ajaxPostResponse["url"];

		var ajaxDelete = $.ajax({
			type: "DELETE",
			url: strDeleteUrl,
			headers: {
				Accept: "application/vnd.github.v3+json",
				Authorization: "token "+strGithubToken
			}
		});

		ajaxDelete.done( function() {
			console.log("Delete completed.");
		} );
		ajaxDelete.fail( function() {
			console.log("Delete failed.");
		} );
	}
}

function downloadString(text, fileType, fileName) {
	// https://gist.github.com/danallison/3ec9d5314788b337b682
  var blob = new Blob([text], { type: fileType });

  var a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
}

