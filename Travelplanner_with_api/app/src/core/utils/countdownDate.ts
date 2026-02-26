export const countdownDate = (startDate: string) => {
    const currentDate = new Date();
    const tripStartDate = new Date(startDate);

    // Check if the trip has already started
    if (currentDate > tripStartDate) {
        return `
            <div class="c-tripdetail__countdate--center">
                <div class="c-tripdetail__countdate--number">00</div>
                <div>Days</div>
            </div>
            <div class="c-tripdetail__countdate--center">
                <div class="c-tripdetail__countdate--number">00</div>
                <div>Hours</div>
            </div>
            <div class="c-tripdetail__countdate--center">
                <div class="c-tripdetail__countdate--number">00</div>
                <div>Minutes</div>
            </div>      
            <div class="c-tripdetail__countdate--centerlast">
                <div class="c-tripdetail__countdate--number c-tripdetail__countdate--seconds">00</div>
                <div>Seconds</div>
            </div>`;
    }

    const timeDifference = tripStartDate.getTime() - currentDate.getTime();
  
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    const formattedDays = days.toString().padStart(2, '0');
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
  
    return `
        <div class="c-tripdetail__countdate--center">
            <div class="c-tripdetail__countdate--number">${formattedDays}</div>
            <div>Days</div>
        </div>

        <div class="c-tripdetail__countdate--center">
            <div class="c-tripdetail__countdate--number">${formattedHours}</div>
            <div>Hours</div>
        </div>

        <div class="c-tripdetail__countdate--center">
            <div class="c-tripdetail__countdate--number">${formattedMinutes}</div>
            <div>Minutes</div>
        </div>      
        
        <div class="c-tripdetail__countdate--centerlast">
            <div class="c-tripdetail__countdate--number c-tripdetail__countdate--seconds">${formattedSeconds}</div>
            <div>Seconds</div>
        </div>`;
};
