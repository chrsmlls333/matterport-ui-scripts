(async () => {

    /*
        @author     Chris Eugene Mills
        @created    January 2021
        @edited     January 2021

        Matterport UI Version ?

        INSTRUCTIONS
        
            Make sure you are editing the matterport, but no dialog boxes are open

            Paste this IIAFE into Chrome Devtools Snippets and run 

            If you get errors, make sure your console context is 'top' 

        TODO

            - Ensure 'top' js context programmatically
            - Switch stems and other options
            - Match closest color to given hex code
            - Input stem length in inches or feet vs percent
    */

    // CONFIG /////////////////////////////////////////////

    const colorIndex = 0
    const stemPercent = 0.05 //0.02

    ///////////////////////////////////////////////////////

    // Reporting
    const scriptName = 'Mattertags Mass Edit'
    console.group(scriptName)

    // Find iframe
    const iframe = document.getElementById('showcase-player')
    const doc = iframe.contentWindow.document;

    // Open Mattertags Menu and List
    const mattertagsbtn = doc.querySelector('.right-tool-buttons [data-tooltipname="Mattertags"]')
    if (!mattertagsbtn.classList.contains('active')) {
        console.log("Open Mattertags")
        mattertagsbtn.click()
        await sleep(0.25)
    }
    const drawersobj = doc.querySelector('div.drawers')
    if (drawersobj.classList.contains('drawer-collapsed')) {
        console.log("Open Drawer")
        drawersobj.querySelector('.drawer-track-thumb').click();
        await sleep(0.75)
    }

    // Get Mattertags, iterate
    const tags = doc.querySelectorAll('#DRAWER_MATTERTAGS .accordion-item')
    console.log(`${tags.length} Mattertags found...`)

    for (const [i, tag] of tags.entries()) {

        // open edit menu
        tag.querySelector('.item-more-options').click()
        await checkElement(tag, '[id^="tooltip-wrapper"].open')

        // click Edit
        Array.from(tag.querySelectorAll('.tooltip-menu .tpMsg')).find(e => e.innerText.toLowerCase() == "edit").click()
        editDialog = await checkElement(doc, '.billboard-editing .tag-wrapper.active')

        // adjust Color
        const colorbtn = editDialog.querySelector('.billboard-menu-item.color')
        colorbtn.click()
        await sleep(0.1)
        const colorPicker = await checkElement(editDialog, '.color-picker')
        const swatch = colorPicker.children[colorIndex]
        const color = swatch.getAttribute('data-value')
        swatch.click();
        await sleep(0.1)
        colorbtn.click();
        await checkElement(editDialog, '.color-picker', false)

        console.log(`[${i+1}] set color to %c${color}`, `background: ${color}`)

        // adjust Stem
        const stembtn = editDialog.querySelector('.billboard-menu-item.stem')
        stembtn.click()
        const stemMenu = await checkElement(editDialog, '.stem-popover')
        const slider = stemMenu.querySelector(".slider-with-tooltip > .mdc-slider")
        const sr = slider.getBoundingClientRect()
        const m1 = new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
            clientX: sr.x + (sr.width * Math.min(Math.max(stemPercent, 0), 1)),
            clientY: sr.y + sr.height / 2,
        })
        const m2 = new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
        })
        slider.dispatchEvent(m1)
        await sleep(0.1)
        slider.dispatchEvent(m2)
        await sleep(0.1)
        stembtn.click()
        await checkElement(editDialog, '.stem-popover', false)

        console.log(`[${i+1}] set stem height to ${stemPercent*100}%`)

        // Close Edit Dialog
        const donebtn = editDialog.querySelector('.mattertag-btn.done-btn')
        donebtn.click()
        await checkElement(doc, '.billboard-editing .tag-wrapper.active', false)
        await sleep(0.25)
    }

    // end Reporting
    console.log("Complete.")
    //     console.timeEnd()
    console.groupEnd(scriptName)


    // FUNCTIONS /////////////////////////////////////////////////////////////

    function sleep(s) {
        return new Promise(resolve => setTimeout(resolve, s * 1000))
    }

    function raf() {
        return new Promise(resolve => requestAnimationFrame(resolve))
    }

    async function checkElement(parent, selector, exists = true, maxloops = 300) {
        let loops = 0
        while ((parent.querySelector(selector) === null) === exists) {
            if (loops++ > maxloops) throw `checkElement('${selector}') looped too long...`
            await raf()
        }
        // console.info(`checkElement('${selector}') looped ${loops} times`)
        return parent.querySelector(selector)
    }

})().catch(err => {
    console.error(err);
    console.groupEnd();
});
