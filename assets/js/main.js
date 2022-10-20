const { createApp } = Vue;

createApp({
    data() {
        return {
            title: '',
            events: [],
            backupEvents: [],
            URI: 'https://amazing-events.herokuapp.com/api/events',
            categories: [],
            checksOn: [],
            querySearch: '',
            eventDetail: {},
            stats: {
                hightAssistence:{},
                lowAssistence: {},
                hightCapacity: {},
                pastStats: [],
                upStats: [],
            },
        }
    },
    created(){
        this.getData();
    },
    mounted(){
    },
    methods: {
        getData(){
            fetch(this.URI)
            .then(res => res.json())
            .then(data => {
                this.backupEvents = data.events;
                let pastEvents = data.events.filter(e => e.date < data.currentDate);
                let upEvents = data.events.filter(e => e.date > data.currentDate);
                let path = location.pathname;

                switch(true){
                    case path.includes('past'):
                        this.backupEvents = pastEvents;
                        this.title = 'Past Events';
                        break;
                    case path.includes('upcoming'):
                        this.backupEvents = upEvents;
                        this.title = 'Upcoming Events';
                        break;
                    default:
                        this.title = 'Home';
                }
                this.events = this.backupEvents;
                this.events.forEach(event => {
                    if(!this.categories.includes(event.category)){
                        this.categories.push(event.category)
                    }
                })

                //Detail
                let queryString = location.search;
                let params = new URLSearchParams(queryString);
                let id = params.get('id');
                this.eventDetail = this.events.find(event => event._id == id);

                //Stasts
                this.stats.pastStats = this.getAllStats(pastEvents)
                this.stats.upStats = this.getAllStats(upEvents)
                this.events.sort((a, b) => a.capacity - b.capacity);
                pastEvents.sort((a, b) => (a.assistance / a.capacity) - (b.assistance / b.capacity));

                this.stats.hightAssistence = pastEvents[29]; //hight assistance
                this.stats.lowAssistence = pastEvents[0]; //low assistance
                this.stats.hightCapacity = this.events[49]; //hight capacity
            })
        },
        getCategories(data){
            let categories = [];
            data.forEach(event => !categories.includes(event.category) ? categories.push(event.category) : '');
            return categories;
        },
        sendForm() {
            Swal.fire({
                title: 'Message sent !',
                text: 'Thank you for contacting us',
                icon: 'success',
                confirmButtonText: 'Continue'
            })
        },
        getAllStats(data){
            let result = [];
            let categories = this.getCategories(data);
            categories.forEach(category => {
                let cat = {
                    name : category,
                    revenue : 0,
                    percent : 0,
                    events: 0
                }

                data.forEach(event => {
                    if(event.category == category) {
                        cat.revenue = cat.revenue + (event.price * (event.assistance ?? event.estimate));
                        cat.percent = cat.percent + ((event.assistance ?? event.estimate) / event.capacity) * 100;
                        cat.events = cat.events + 1
                    }
                })
                cat.percent = (cat.percent / cat.events).toFixed(2);
                result.push(cat);
            })
            return result;
        }
    },
    computed: {
        superFiltro() {
            let filter1 = this.backupEvents.filter(event => event.name.toLowerCase().includes(this.querySearch.toLowerCase().trim()));
            let filter2 = this.checksOn.length > 0 ? filter1.filter(event => this.checksOn.includes(event.category)) : filter1;
            this.events = filter2;
        }
    }
}).mount('#app');


//TODO no es necesario pero puedo hacer una funcion que active los a del navbar con el title algo asi: :class="[title == 'home' ? active : '']"