function timeFormattedET() {
    let timeNow = new Date();
    let hourNow = timeNow.getHours();
    let minuteNow = timeNow.getMinutes();
    let secondNow = timeNow.getSeconds();
    if (minuteNow < 10) {
        minuteNow = '0' + minuteNow;
    }

    if (secondNow < 10) {
        secondNow = '0' + secondNow;
    }
    let timeFormatted = hourNow + ':' + minuteNow + ':' + secondNow;
    return timeFormatted;

}
let monthType = 0;

function dateFormattedET(monthType){
    let timeNow = new Date();
    let monthNow = timeNow.getMonth();
    let dateNow = timeNow.getDate();
    let yearNow = timeNow.getFullYear();

    let monthNamesET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];

    let monthNamesETv = ['näärikuu', 'küünlakuu', 'paastukuu', 'jürikuu', 'lehekuu', 'jaanikuu', 'heinakuu', 'lõikuskuu', 'sügiskuu','viinakuu','talvekuu','jõulukuu']
    if (monthType === 0) {
        return dateNow + '. ' + monthNamesET[monthNow] + ' ' + yearNow;
    }
    if (monthType === 1) {
        return dateNow + '. ' + monthNamesETv[monthNow] + ' '+ yearNow;
    }
}

function toggleMonthNameSwitch(){
    if (monthType === 1){
        monthType = 0;
    }
    else {
        monthType = 1;
    }
    updateDate();

}
function weekdayET(){
    let weekday = new Date().getDay();
    const weekdayNamesET = ['Pühapäev', 'Esmaspäev', 'Teisipäev' , 'Kolmapäev', 'Neljapäev' , 'Reede','Laupäev']
    return weekdayNamesET[(weekday)]
}
module.exports = {
    timeFormattedET,
    dateFormattedET,
    weekdayET
}