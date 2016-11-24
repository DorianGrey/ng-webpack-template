import {Component} from "@angular/core";

@Component({
  selector: "not-found",
  /* tslint:disable */
  template: `
    <div>
      <h2>404 | Well, That about Wraps It Up for This Page</h2>
      <blockquote>
        <p>’I refuse to prove that I exist,’ says Page, ’for proof denies faith, and without faith I am nothing.’</p>
        <p>’But,’ says Man, ’The Babel fish is a dead giveaway, isn’t it? It could not have evolved by chance. It proves you exist, and so therefore, by your own arguments, you don’t. QED.’</p>
        <p>’Oh dear,’ says Page, ’I hadn’t thought of that,’ and promptly disappears in a puff of logic.</p>
        <p class="italic">– Thanks to <a>https://www.elastic.co</a> for this story</p>
      </blockquote>
    </div>
  `,
  /* tslint:enable */
  styleUrls: ["./not-found.component.scss"],
})
export class NotFoundComponent {
  constructor() {

  }
}