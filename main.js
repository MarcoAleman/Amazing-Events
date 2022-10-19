const { createApp } = Vue;

createApp({
    data() {
        return {
            title: '',
            currentDate: '',
            events: [],
            backupEvents: [],
            URI: 'https://amazing-events.herokuapp.com/api/events',
            categories: [],
            checksOn: [],
            querySearch: '',
            eventDetail: {},
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
                this.currentDate = data.currentDate;
                let path = location.pathname;

                switch(true){
                    case path.includes('past'):
                        this.backupEvents = data.events.filter(e => e.date < data.currentDate);
                        this.events = this.backupEvents;
                        this.events.forEach(event => {
                            if(!this.categories.includes(event.category)){
                                this.categories.push(event.category)
                            }
                        })
                        this.title = 'Past Events';
                        break;
                    case path.includes('upcoming'):
                        this.backupEvents = data.events.filter(e => e.date > data.currentDate);
                        this.events = this.backupEvents;
                        this.events.forEach(event => {
                            if(!this.categories.includes(event.category)){
                                this.categories.push(event.category)
                            }
                        })
                        this.title = 'Upcoming Events';
                        break;
                    default:
                        this.backupEvents = data.events;
                        this.events = this.backupEvents;
                        this.events.forEach(event => {
                            if(!this.categories.includes(event.category)){
                                this.categories.push(event.category)
                            }
                        })
                        this.title = 'Home';
                }

                /* this.backupEvents = data.events;
                this.events = this.backupEvents;
                this.events.forEach(event => {
                    if(!this.categories.includes(event.category)){
                        this.categories.push(event.category)
                    }
                }) */

                //Detail
                let queryString = location.search;
                let params = new URLSearchParams(queryString);
                let id = params.get('id');
                this.eventDetail = this.events.find(event => event._id == id);

            })
        },
        sendForm() {
            Swal.fire({
                title: 'Message sent !',
                text: 'Thank you for contacting us',
                icon: 'success',
                confirmButtonText: 'Continue'
            })
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