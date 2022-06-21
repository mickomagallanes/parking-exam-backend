class Parking {

    constructor() {
        this.rows = 10
        this.columns = 20
        this.map = this.initMap()
        this.entryPoints = [
            { id: 1, row: 2, col: 0 },
            { id: 2, row: 0, col: 5 },
            { id: 3, row: 10, col: 10 }
        ]

    }

    getMap() {
        return this.map;
    }


    getNearestParking(vehicleType, entryPointObj) {
        let nearestRow, nearestCol, nearestDistance, nearestParkingType;
  
        for (let i = 0, n = this.rows; i < n; i++) {
            let currentRow = this.map[i];

            for (let a = 0, b = this.columns; a < b; a++) {

                let currentSlot = currentRow[a];
             
                // check if vehicle fits in parking, if it is not a road, and if it is available
                if (vehicleType <= currentSlot.parkingType && currentSlot.isParkingLot && currentSlot.isAvailable) {
    
                    let currentDistance = this.getUnitDistance(entryPointObj.row, entryPointObj.col, i, a)

                    if (nearestDistance === undefined || currentDistance < nearestDistance) {
                        nearestDistance = currentDistance;
                        nearestRow = i;
                        nearestCol = a;
                        nearestParkingType = currentSlot.parkingType;
                    }


                }

            }
        }

        return { nearestRow, nearestCol, nearestDistance, nearestParkingType }
    }

    getUnitDistance(row, col, parkingRow, parkingCol) {
        return Math.abs(row - parkingRow) + Math.abs(col - parkingCol)
    }

    getRandomParkingType() {
        const min = 0;
        const max = 2;

        return Math.round(Math.random() * (max - min) + min);
    }


    getFees(parkingType, parkingDate) {
        let price = 0;

        let parkingTypeFee = this.getPriceByParkingType(parkingType);

        // round up hour
        let currHours = Math.ceil((new Date() - parkingDate) / (1000 * 60 * 60));

        // calculate 24 hours fee
        if (currHours >= 24) {
            let days = Math.floor(currHours / 24);

            currHours -= 24 * days;
            price += 5000 * days;
            console.log(currHours, parkingTypeFee, parkingType)
            // the remaining hours fee from 24 hour rule is based on parking type
            if (currHours > 0) {
                price += parkingTypeFee * currHours;
            }
        } else if (currHours <= 3 && currHours > 0) {
            // if current hours is just below 3 hours, fee is the flat rate 40
            currHours -= 3;
            price += 40;

            
        } else {
            // if current hours is beyond 3 hours, get flat rate and the exceeding rate
            currHours -= 3;
            price += 40;

            if (currHours > 0) {
                price += parkingTypeFee * currHours;
            }
        }
      
        return price

    }

    getPriceByParkingType(parkingType) {

        if ( parkingType == 0 ) {
            return 20
        } else if ( parkingType == 1 ) {
            return 60
        } else if ( parkingType == 2 ) {
            return 100
        }
    }

    getEntryPoints() {
        return this.entryPoints;
    }

    fillRoad() {
        const mainMap = [];

        for (let i = 0, n = this.rows; i < n; i++) {
            mainMap.push([])
            let currentRow = mainMap[i];

            for (let a = 0, b = this.columns; a < b; a++) {
                currentRow.push(this.createRoadObj(i, a))
            }
        }
        return mainMap;
    }

    fillParkingLot(map) {

        /**
         * idea of map is like a realistic parking lot:
         * x: roadway
         * o: parking lot
         * 
         *     xxxxxxxxxxxxxxxxxxxxx
         *     xooxooxooxooxooxooxox
         *     xooxooxooxooxooxooxox
         *     xooxooxooxooxooxooxox
         *     xooxooxooxooxooxooxox
         *     xooxooxooxooxooxooxox
         *     xooxooxooxooxooxooxox
         *     xooxooxooxooxooxooxox
         *     xxxxxxxxxxxxxxxxxxxxx
         */

        for (let i = 0, n = map.length; i < n; i++) {
            if (i == this.rows - 1 || i == 0) {
                continue;
            }

            let currentRow = map[i];
            let parkingCounter = 0;

            for (let a = 0, b = currentRow.length; a < b; a++) {
                if (parkingCounter == 0) {
                    parkingCounter++;
                    continue;
                } else {
                    currentRow[a] = this.createParkingOrVehicleObj(i, a)

                    // prevent last column to be a parking space if there would be no road after it
                    if (a + 2 == b || parkingCounter == 2) {
                        parkingCounter = 0
                    } else {
                        parkingCounter++
                    }

                }

            }
        }

        return map;
    }

    createRoadObj(row, col) {
        const roadObj = { isParkingLot: false, isAvailable: false, row: row, col: col, vehicleType: false, parkingType: false }

        return roadObj;
    }

    createParkingOrVehicleObj(row, col, isAvailable = true, vehicleType = false, parkingType = this.getRandomParkingType(), startedAt = false) {
        const parkingOrVehicleObj = {
            isParkingLot: true,
            isAvailable: isAvailable,
            row: row,
            col: col,
            vehicleType: vehicleType,
            parkingType: parkingType,
            startedAt: startedAt
        }

        return parkingOrVehicleObj;
    }

    parkVehicle(vehicleType, entryPoint) {

        let entryPointObj = this.entryPoints.find(obj => obj.id == entryPoint);

        let { nearestRow, nearestCol, nearestDistance, nearestParkingType } = this.getNearestParking(vehicleType, entryPointObj);

        

        if (nearestDistance === undefined) {

            // no parking lot available for the vehicle
            return false;
        } else {

            // set parking lot
            this.map[nearestRow][nearestCol] = this.createParkingOrVehicleObj(nearestRow, nearestCol, false, vehicleType, nearestParkingType,  new Date(new Date().getTime() - (25 * 60 * 60 * 1000)))

            return true;
        }

    }

    unparkVehicle(row, col) {

        let currentParkingLot = this.map[row][col]

        if (currentParkingLot.isParkingLot && !currentParkingLot.isAvailable) {
            let currentFees = this.getFees(currentParkingLot.parkingType, currentParkingLot.startedAt);

            // create parking lot on the unparked space with the same parking type
            this.map[row][col] = this.createParkingOrVehicleObj(row, col, true, false, currentParkingLot.parkingType, false)
    
            return currentFees;
        } else { 
            return false
        }
       

    }


    initMap() {
        let mapWithRoads = this.fillRoad();

        return this.fillParkingLot(mapWithRoads);
    }

}

module.exports = Parking;