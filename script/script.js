/* FETCH */

const housePage = document.querySelector("#house")
const senatePage = document.querySelector("#senate")

housePage ? addFetch("house") : addFetch("senate")

function addFetch(chamber) {
    let initialize = {
        headers: {
            "X-API-Key": "KXW3LWI4VwB3i2QyaS3FGQw9XT9FTkPv3nOwYzTO"
        }
    }
    
    var loaders = document.querySelectorAll("#loader")
    loaders = Array.from(loaders)
    fetch(`https://api.propublica.org/congress/v1/113/${chamber}/members.json`,initialize)
        .then(res => res.json())
        .then(json => {
            let data = [...json.results[0].members]
            runProgram(data)
        })
        .catch(err => {
            let mainTag = document.querySelector("main")
            mainTag.innerHTML = ""
            let mainTagDiv = document.createElement("div")
            mainTagDiv.innerHTML = `<div class="d-flex justify-content-center align-items-center shadow-lg pt-5"> 
            <img src="./assets/error_msg2.png" alt="Error message"/>
            </div>`
            mainTag.appendChild(mainTagDiv)
            console.error("error", err)
        })
        .finally(() => {
            loaders.forEach(loader => {
                loader.className = "d-none"    
            })
        })
} 

function runProgram(data) {
    /* VARIABLES */
    
    var stateOption = "ALL"
    var partyOptions = []
    var membersFiltered = []
    var showFiltered = []
    var members = data
    
    if (document.title == "Home TGIF") {
        /* CODE FOR INDEX HTML */

        /* read more or less button */
        let readButton = document.getElementsByName("readMore")
        let readButton1 = document.querySelector("#readButton")
        readButton.forEach(button => {
            button.addEventListener("click", (e) => {
                if (button.innerText == "Read more") {
                    readButton1.innerText= "Read less"
                } else {
                    readButton1.innerText = "Read more"
                }
            })
        })  
        
    } else if (document.title == "House TGIF" || document.title == "Senate TGIF") {
        /* CODE FOR HOUSE AND SENATE HTML */

        /* check if there are some filters active */
        function filters() {
            if (stateOption !== "ALL") {
                membersFiltered = members.filter(member => member.state == stateOption)
            } else {
                membersFiltered = members
            }
        
            showFiltered = []
            if (partyOptions.length > 0) {
                showFiltered = membersFiltered.filter(member => partyOptions.includes(member.party))
            } else {
                showFiltered = membersFiltered
            }
        }

        /* add rows to the table with info  */
        function addTableRow() {
            let table = document.getElementById("tBodyTable")
            table.innerHTML = ""
            filters()
            if (showFiltered.length == 0) {
                let tableRowNotFound = document.createElement("tr")
                    tableRowNotFound.innerHTML = `<td colspan="5" class="text-muted">Not found </td>`
                    table.appendChild(tableRowNotFound)
                } 
            showFiltered.forEach(member => {
                let tableRow = document.createElement("tr")
                tableRow.innerHTML = `<td> <a class="text-decoration-none" href="${member.url}" target="_blank"> ${member.first_name} ${member.middle_name || ""} ${member.last_name}</td> <td>${member.party}</td> <td>${member.state}</td> <td>${member.seniority}</td> <td>${(member.votes_with_party_pct).toFixed(2)} %</td> `
                table.appendChild(tableRow)
                })
        }
        
        /* add states list and parties checkboxes states */
        function addFiltersInfo(members) {
            
            /* add states to filter list  */
            var stateList = []
            members.forEach((member) => {
                stateList.push(member.state)
            })
            let uniqStateList = stateList.filter((state,index) => {
                return stateList.indexOf(state) === index
            })
            let orderStateList = uniqStateList.sort()
            
            let getSelect = document.getElementById("stateList")
            orderStateList.forEach((state) => {
                let listRow = document.createElement("option")
                listRow.setAttribute("value", state)
                listRow.innerText = state
                getSelect.appendChild(listRow)
            })

            /* for state selector */
            getSelect.addEventListener("change", (e) => {
                e.preventDefault
                let stateSelected = e.target.value                          
                stateOption = stateSelected
                addTableRow()    
            })  

            /* set disable or not to parties checkboxes */
            var partyList = []
            members.forEach((member) => {
                partyList.push(member.party)
            })
            let uniqPartyList = partyList.filter((party,index) => {
                return partyList.indexOf(party) === index
            })
            let getPartyFilters = document.getElementsByName("party")
            getPartyFilters = Array.from(getPartyFilters)
            getPartyFilters.forEach(partyFiltered => {
                if (uniqPartyList.includes(partyFiltered.value)) {
                    partyFiltered.removeAttribute("disabled","")
                    partyFiltered.previousElementSibling.removeAttribute("class", "text-muted")
                } else {
                    partyFiltered.setAttribute("disabled","")
                    partyFiltered.previousElementSibling.setAttribute("class", "text-muted")
                }
            })
             
            /* for party selector */
            getPartyFilters.forEach(partyFiltered => {
                partyFiltered.addEventListener("change", (e) => {
                    let partyValue = e.target.value
                    let partyChecked = e.target.checked
                    if (partyChecked == true) {
                        partyOptions.push(partyValue)
                    } else {
                        partyOptions = partyOptions.filter(party => party !== partyValue)       
                    }
                    addTableRow()
                }) 
            })

            /* set clear filters button */
            let clearButton = document.querySelector("#clearButton")
            clearButton.addEventListener("click", (e) => {
                getSelect.value = "ALL"
                getPartyFilters.forEach(partyBox => {
                    partyBox.checked = false
                    
                })
                stateOption = "ALL"
                partyOptions = []
                addTableRow()
            })
        }

        addTableRow()
        addFiltersInfo(members)

    } else if (document.title == "Attendance House - TGIF" || document.title == "Attendance Senate - TGIF" || document.title == "Loyalty House - TGIF" || document.title == "Loyalty Senate - TGIF") {
        /* CODE FOR ATTENDANCE (HOUSE/SENATE) HTML */

        /* STATISTICS OBJECT */
        const statistics = {
            totalRepublicans: 0,
            totalDemocrats: 0,
            totalIndependents: 0,
            totalAllMembers: 0,
            
            averageVWPRepublicans: 0,
            averageVWPDemocrats: 0,
            averageVWPIndependet: 0,
            totalAverageVWP: 0,
            
            averageMVPRepublicans: 0,
            averageMVPDemocrats: 0,
            averageMVPIndependet: 0,
            totalAverageMVP: 0,
            
            leastEngagedList: [],
            mostEngagedList: [],
            leastLoyalList: [],
            mostLoyalList: [],
            tenPct: 0.1
        }

        var newMembersList = members.slice(0)  

        /* BASIC INFO TO STATISTICS OBJECT */
        function getBasicStatistics() {

            var republicansList = newMembersList.filter(member => member.party === "R")
            statistics.totalRepublicans = republicansList.length
            
            statistics.averageMVPRepublicans = (republicansList.reduce((count, republican) => count + republican.missed_votes_pct, 0)) / statistics.totalRepublicans
            statistics.averageVWPRepublicans = (republicansList.reduce((count, republican) => count + republican.votes_with_party_pct, 0)) / statistics.totalRepublicans
        
            var democratsList = newMembersList.filter(member => member.party === "D")
            statistics.totalDemocrats = democratsList.length

            statistics.averageMVPDemocrats = (democratsList.reduce((count, democrat) => count + democrat.missed_votes_pct, 0)) / statistics.totalDemocrats
            statistics.averageVWPDemocrats = (democratsList.reduce((count, democrat) => count + democrat.votes_with_party_pct, 0)) / statistics.totalDemocrats

            var independentsList = newMembersList.filter(member => member.party === "ID")
            statistics.totalIndependents = independentsList.length

            statistics.averageMVPIndependet = (independentsList.reduce((count, independet) => count + independet.missed_votes_pct, 0)) / statistics.totalIndependents
            console.log(statistics.averageMVPIndependet)
            statistics.averageVWPIndependet = (independentsList.reduce((count, independet) => count + independet.votes_with_party_pct, 0)) / statistics.totalIndependents
            console.log(statistics.averageVWPIndependet)

            statistics.totalAllMembers = newMembersList.length  


            // if (independentsList >= 0) {

            // }

            // if (independentsList.length >= 0) {
            //     statistics.totalAverageVWP = "-" 
            //     console.log("entro if")
            // } else {
            //     statistics.totalAverageVWP = (statistics.averageVWPRepublicans + statistics.averageVWPDemocraats + statistics.averageVWPIndependet) / 3
            //     console.log("entro else")
            // }



            // if (!independentsList) {
            //     statistics.totalAverageVWP = 0 
            // } else {
            //     statistics.totalAverageVWP = (statistics.averageVWPRepublicans + statistics.averageVWPDemocraats + statistics.averageVWPIndependet) / 3
            // }
        }
        
        /* DETAIL LISTS TO STATISTICS OBJECT IN ATTENDANCE PAGES */
        function getAttendaceStatistics(newMembersList) {

            newMembersList = newMembersList.filter(member => member.total_votes != 0)
            newMembersList.sort((a,b) => b.missed_votes_pct - a.missed_votes_pct)
            let newMembersBottom = checkTenPct(newMembersList, "attendance")
            var leastTenPct = newMembersList.slice(0, statistics.totalAllMembers * statistics.tenPct)
            newMembersBottom = newMembersBottom.splice(1, newMembersBottom.length)
            statistics.leastEngagedList = leastTenPct.concat(newMembersBottom)
            
            newMembersList.reverse()
            newMembersBottom = checkTenPct(newMembersList, "attendance")
            var mostTenPct = newMembersList.slice(0, statistics.totalAllMembers * statistics.tenPct)
            newMembersBottom = newMembersBottom.splice(1, newMembersBottom.length)
            statistics.mostEngagedList = mostTenPct.concat(newMembersBottom)
        }

        /* DETAIL LISTS TO STATISTICS OBJECT IN LOYALTYPAGES */
        function getLoyaltyStatistics(newMembersList) {

            newMembersList = newMembersList.filter(member => member.total_votes != 0)
            newMembersList.sort((a,b) => b.votes_with_party_pct - a.votes_with_party_pct)
            let newMembersBottom = checkTenPct(newMembersList, "loyalty")
            var leastTenPct = newMembersList.slice(0, statistics.totalAllMembers * statistics.tenPct)
            newMembersBottom = newMembersBottom.splice(1, newMembersBottom.length)
            statistics.leastLoyalList = leastTenPct.concat(newMembersBottom)

            newMembersList.reverse()
            newMembersBottom = checkTenPct(newMembersList, "loyalty")
            var mostTenPct = newMembersList.slice(0, statistics.totalAllMembers * statistics.tenPct)
            newMembersBottom = newMembersBottom.splice(1, newMembersBottom.length)
            statistics.mostLoyalList = mostTenPct.concat(newMembersBottom)
        }

        /* CHECK IF ARE MORE THAN ONE EQUAL SCORE IN 10% PLACE */
        function checkTenPct(newMembersList, feature) {
            let membersBottom = []
            newMembersList.forEach(member => {
                if (feature == "attendance") {
                    if (newMembersList[Math.round((statistics.totalAllMembers) * statistics.tenPct) -1].missed_votes_pct == member.missed_votes_pct) {
                        membersBottom.push(member)
                    }
                } else {
                    if (newMembersList[Math.round((statistics.totalAllMembers) * statistics.tenPct) -1].votes_with_party_pct == member.votes_with_party_pct) {
                        membersBottom.push(member)
                    }
                }
            }) 
            return membersBottom
        }   

        /* RENDERIZADO */

        function addAttendanceAtGlanceData(object) {
            
            let getAttendaceTableTr1 = document.getElementById("mVPTr1")
            getAttendaceTableTr1.innerHTML = `<td>Republicans</td> <td>${object.totalRepublicans}</td> <td>${(object.averageMVPRepublicans).toFixed(2)} %</td>`
            
            let getAttendaceTableTr2 = document.getElementById("mVPTr2")
            getAttendaceTableTr2.innerHTML = `<td>Democrats</td> <td>${object.totalDemocrats}</td> <td>${(object.averageMVPDemocrats).toFixed(2)} %</td>`
            
            let getAttendaceTableTr3 = document.getElementById("mVPTr3")
            getAttendaceTableTr3.innerHTML = `<td>Independets</td> <td>${object.totalIndependents}</td> <td>${(!object.totalIndependents === "NaN" ? object.averageMVPIndependet.toFixed(2) : "-")} </td>`
            
            let getAttendaceTableTr4 = document.getElementById("mVPTr4")
            getAttendaceTableTr4.innerHTML = `<td>Total</td> <td>${object.totalAllMembers}</td> <td>${(!object.totalIndependents === "NaN" ? object.averageVWPIndependet.toFixed(2) : "-")} </td>`
        }
        
        function addLoyaltyAtGlanceData(object) {

            let getLoyaltyTableTr1 = document.getElementById("vWPTr1")
            getLoyaltyTableTr1.innerHTML = `<td>Republicans</td> <td>${object.totalRepublicans}</td> <td>${(object.averageVWPRepublicans).toFixed(2)} %</td>`
            
            let getLoyaltyTableTr2 = document.getElementById("vWPTr2")
            getLoyaltyTableTr2.innerHTML = `<td>Democrats</td> <td>${object.totalDemocrats}</td> <td>${(object.averageVWPDemocrats).toFixed(2)} %</td>`
            
            let getLoyaltyTableTr3 = document.getElementById("vWPTr3")
            getLoyaltyTableTr3.innerHTML = `<td>Independents</td> <td>${object.totalIndependents}</td> <td>${(!object.totalIndependents === "NaN" ? object.averageVWPIndependet.toFixed(2) : "-")} </td>`
            
            let getLoyaltyTableTr4 = document.getElementById("vWPTr4")
            getLoyaltyTableTr4.innerHTML = `<td>Total</td> <td>${object.totalAllMembers}</td> <td>${(!object.totalIndependents === "NaN" ? object.averageVWPIndependet.toFixed(2) : "-")} </td>`
            if (object.totalIndependents === "NaN") {
                console.log("entro")    
            }
        }


        function addAttendanceFeatureData(feature, object) {
            
            let dataList = feature == "least" ? object.leastEngagedList : object.mostEngagedList
            let table = document.querySelector(`#${feature}EngagedTable > tbody`)
            dataList.forEach(data => {
                let tableRow = document.createElement("tr")
                tableRow.className = "table text-center"
                tableRow.innerHTML = `
                <td> <a class="text-decoration-none" href="${data.url}" target="_blank"> ${data.first_name} ${data.middle_name || ""} ${data.last_name}</a> </td> 
                <td> ${(data.missed_votes)} </td> 
                <td> ${(data.missed_votes_pct).toFixed(2)} %</td>`
                table.appendChild(tableRow)  
            })   
        }
        
        function addLoyaltyFeatureData(feature, object) {
            
            let dataList = feature == "least" ? object.leastLoyalList : object.mostLoyalList
            let table = document.querySelector(`#${feature}LoyaltyTable > tbody`)
            dataList.forEach(data => {
                let tableRow = document.createElement("tr")
                tableRow.className = "table text-center"
                tableRow.innerHTML = `
                <td> <a class="text-decoration-none" href="${data.url}" target="_blank"> ${data.first_name} ${data.middle_name || ""} ${data.last_name}</a> </td> 
                <td> ${Math.round((data.votes_with_party_pct * data.total_votes) / 100)} </td> 
                <td> ${(data.votes_with_party_pct).toFixed(2)} %</td>`
                table.appendChild(tableRow)  
            })    
        }

        function addDataToTables(list, object) {
            if (document.querySelector("h2").textContent == "Attendance") {
                getAttendaceStatistics(list)
                addAttendanceAtGlanceData(object)
                addAttendanceFeatureData("least", object)
                addAttendanceFeatureData("most", object)
            } else if (document.querySelector("h2").textContent == "Party Loyalty") {
                getLoyaltyStatistics(list)
                addLoyaltyAtGlanceData(object)
                addLoyaltyFeatureData("least", object)
                addLoyaltyFeatureData("most", object)
            }  
        }
        getBasicStatistics()
        addDataToTables(newMembersList, statistics)
        console.log(statistics)
    }
}
