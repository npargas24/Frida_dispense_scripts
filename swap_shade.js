Java.perform(function () {
    var BeamLipsController = Java.use("com.vinsol.loreal.PersoLips.utils.BeamLipsController");
    var overload = BeamLipsController.dispenseFor.overload(
        'int',
        'java.lang.String',
        'int',
        'int',
        'int',
        'float',
        'int'
    );

    overload.implementation = function(deviceId, colorUniverse, red, green, blue, volume, dose) {
        console.log("\n=== dispenseFor(...) called ===");
        console.log("Device ID: " + deviceId);
        console.log("Color Universe: " + colorUniverse);
        console.log("Original Red: " + red);
        console.log("Original green: " + green);
        console.log("Original Blue: " + blue);
        console.log("Original volume: " + volume);
        console.log("Original dose: " + dose);

        console.log("---------------------- Altering Color Values to print CN24  -------------------------");
        
        red = 200;
        green = 114;
        blue = 92;

        console.log("Modified Red: " + red);
        console.log("Modified Green: " + green);
        console.log("Modified Blue: " + blue);
       
        return overload.call(
            this,
            deviceId,
            colorUniverse,
            red,
            green,
            blue,
            volume,
            dose
        );
    };

    console.log("*** Hooked correct overload of dispenseFor in BeamLipsController ***");
});
